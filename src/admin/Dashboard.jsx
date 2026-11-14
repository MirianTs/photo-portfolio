import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabaseClient.js'
import { safePathPart } from '../lib/storagePath.js'

function Dashboard() {
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [category, setCategory] = useState('uncategorized')
  const [error, setError] = useState('')
  const dragIndex = useRef(null)
  const loadRequest = useRef(0)
  // Category of the card being edited, as it was when the field got focus.
  const categoryBeforeEdit = useRef(null)

  const loadPhotos = async () => {
    // Uploads, failed saves and the first render can all trigger a reload.
    // Number each request so a slow, older response cannot overwrite a newer one.
    const request = ++loadRequest.current
    setLoading(true)
    try {
      const { data, error: fetchError } = await supabase
        .from('photos')
        // Only the columns the dashboard reads; created_at is never shown.
        .select('id, url, storage_path, category, position')
        .order('position', { ascending: true })
      if (request !== loadRequest.current) return
      if (fetchError) setError(fetchError.message)
      else setPhotos(data || [])
    } catch (err) {
      if (request !== loadRequest.current) return
      // A dropped connection throws; without this "Loading photos…" never goes away.
      setError(err instanceof Error ? err.message : 'Could not load photos.')
    } finally {
      if (request === loadRequest.current) setLoading(false)
    }
  }

  useEffect(() => {
    loadPhotos()
  }, [])

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setUploading(true)
    setError('')

    try {
      // Ask the database for the current last position instead of trusting the
      // list on screen, which is still empty if the upload starts before it loads.
      const { data: lastRows, error: positionError } = await supabase
        .from('photos')
        .select('position')
        .order('position', { ascending: false })
        .limit(1)
      if (positionError) throw positionError
      let nextPosition = lastRows?.length ? lastRows[0].position + 1 : 0

      for (const file of files) {
        // accept="image/*" is only a hint: the file picker's "All files" option
        // and drag-and-drop onto the input can still hand over other files.
        if (!file.type.startsWith('image/')) {
          setError(`${file.name} is not an image and was skipped.`)
          continue
        }

        const cleanCategory = category.trim() || 'uncategorized'
        const storagePath = `${safePathPart(cleanCategory)}/${crypto.randomUUID()}-${safePathPart(file.name)}`

        const { error: uploadError } = await supabase.storage
          .from('photos')
          // Every path contains a fresh UUID, so a file never changes once
          // uploaded and browsers may cache it for a year (default: 1 hour).
          .upload(storagePath, file, { cacheControl: '31536000' })

        if (uploadError) {
          setError(uploadError.message)
          continue
        }

        const { data: urlData } = supabase.storage.from('photos').getPublicUrl(storagePath)

        const { error: insertError } = await supabase.from('photos').insert({
          url: urlData.publicUrl,
          storage_path: storagePath,
          category: cleanCategory,
          position: nextPosition,
        })

        if (insertError) {
          setError(insertError.message)
          // Without a row the file would never show up, so don't leave it in storage.
          await supabase.storage.from('photos').remove([storagePath])
          continue
        }
        nextPosition += 1
      }
    } catch (err) {
      // A dropped connection throws instead of returning an error object.
      setError(err instanceof Error ? err.message : 'Upload failed.')
    } finally {
      setUploading(false)
      e.target.value = ''
      loadPhotos()
    }
  }

  const handleDelete = async (photo) => {
    if (!confirm('Delete this photo?')) return
    setError('')
    try {
      // Row-level security silently skips rows the user may not delete, with
      // no error, so ask for the deleted row back to know it really went.
      const { data: deleted, error: deleteError } = await supabase
        .from('photos')
        .delete()
        .eq('id', photo.id)
        .select('id')
      if (deleteError) {
        setError(deleteError.message)
        return
      }
      if (!deleted?.length) {
        setError('The photo could not be deleted (it may already be gone). Reloading the list.')
        loadPhotos()
        return
      }
    } catch (err) {
      // A dropped connection throws instead of returning an error object.
      setError(err instanceof Error ? err.message : 'Delete failed.')
      return
    }
    // The row is gone from here on, so the card goes away even if removing
    // the file fails below.
    setPhotos((prev) => prev.filter((p) => p.id !== photo.id))
    try {
      // Only remove the file once the row is gone, so the gallery never points at a missing file.
      const { error: removeError } = await supabase.storage
        .from('photos')
        .remove([photo.storage_path])
      // The photo is already gone from the gallery; just report the leftover file.
      if (removeError) setError(`Photo removed, but its file was not deleted: ${removeError.message}`)
    } catch (err) {
      const reason = err instanceof Error ? err.message : 'network error'
      setError(`Photo removed, but its file was not deleted: ${reason}`)
    }
  }

  // Typing only updates the card; the new category is saved once the field
  // loses focus, instead of sending one database write per keystroke.
  const handleCategoryChange = (photo, newCategory) => {
    setPhotos((prev) =>
      prev.map((p) => (p.id === photo.id ? { ...p, category: newCategory } : p)),
    )
  }

  const handleCategorySave = async (photo) => {
    // Same rule as uploads: a blank category falls back to "uncategorized".
    const cleanCategory = photo.category.trim() || 'uncategorized'
    if (cleanCategory !== photo.category) handleCategoryChange(photo, cleanCategory)
    // Tabbing through the cards blurs every field; only write real changes.
    if (cleanCategory === categoryBeforeEdit.current) return
    let failure = null
    try {
      const { error: updateError } = await supabase
        .from('photos')
        .update({ category: cleanCategory })
        .eq('id', photo.id)
      if (updateError) failure = updateError.message
    } catch (err) {
      failure = err instanceof Error ? err.message : 'Could not save the category.'
    }
    if (failure) {
      setError(failure)
      // The card still shows the unsaved text; reload so it matches what is stored.
      loadPhotos()
    }
  }

  const handleDragStart = (e, index) => {
    dragIndex.current = index
    // Firefox only starts a drag when some data is attached to it.
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(index))
  }

  // A drag dropped outside any card never reaches handleDrop; forget it so a
  // later drop (for example a file dragged in from the desktop) is not
  // mistaken for this card being moved.
  const handleDragEnd = () => {
    dragIndex.current = null
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleDrop = async (e, index) => {
    // Cards accept drops (see handleDragOver), so without this a photo file
    // dragged in from the desktop would make the browser leave the page to open it.
    e.preventDefault()
    const from = dragIndex.current
    dragIndex.current = null
    if (from === null || from === index) return

    const reordered = [...photos]
    const [moved] = reordered.splice(from, 1)
    reordered.splice(index, 0, moved)

    // Positions become 0..n-1, which also closes gaps left behind by deleted
    // photos. Only rows whose position actually changes are written, so moving
    // one card a step costs two requests instead of one per photo.
    const changed = reordered
      .map((photo, i) => ({ photo, position: i }))
      .filter(({ photo, position }) => photo.position !== position)
    setPhotos(reordered.map((photo, i) => ({ ...photo, position: i })))
    let failure = null
    try {
      const results = await Promise.all(
        changed.map(({ photo, position }) =>
          supabase.from('photos').update({ position }).eq('id', photo.id),
        ),
      )
      failure = results.find((result) => result.error)?.error.message ?? null
    } catch (err) {
      // A dropped connection throws instead of returning an error object.
      failure = err instanceof Error ? err.message : 'network error'
    }
    if (failure) {
      setError(`Could not save the new order: ${failure}`)
      // Reload so the list matches what is actually stored.
      loadPhotos()
    }
  }

  const handleLogout = () => supabase.auth.signOut()

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h1>Photo Admin</h1>
        <button className="admin-btn admin-btn-ghost" onClick={handleLogout}>
          Log Out
        </button>
      </header>

      <section className="admin-upload">
        <input
          type="text"
          placeholder="Category (e.g. nature, street)"
          aria-label="Category for new uploads"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
        <label className="admin-btn admin-upload-btn">
          {uploading ? 'Uploading…' : 'Upload Photos'}
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleUpload}
            disabled={uploading}
            className="visually-hidden"
          />
        </label>
      </section>

      {error && (
        <p className="admin-error" role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <p role="status">Loading photos…</p>
      ) : photos.length === 0 ? (
        <p>No photos yet — upload some above.</p>
      ) : (
        <p className="admin-hint">Drag cards to reorder how they appear in the gallery.</p>
      )}

      <div className="admin-grid">
        {photos.map((photo, index) => (
          <div
            key={photo.id}
            className="admin-card"
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
          >
            <img src={photo.url} alt="" loading="lazy" decoding="async" />
            <input
              type="text"
              className="admin-card-category"
              aria-label="Photo category"
              value={photo.category}
              onFocus={() => (categoryBeforeEdit.current = photo.category)}
              onChange={(e) => handleCategoryChange(photo, e.target.value)}
              onBlur={() => handleCategorySave(photo)}
            />
            <button className="admin-btn admin-btn-danger" onClick={() => handleDelete(photo)}>
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Dashboard
