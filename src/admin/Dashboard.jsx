import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabaseClient.js'

// Supabase Storage rejects object keys with spaces, accents or non-Latin
// letters, so only safe characters go into the file path. The category shown
// in the gallery is stored unchanged in the database row.
const safePathPart = (text) =>
  text.replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '') || 'file'

function Dashboard() {
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [category, setCategory] = useState('uncategorized')
  const [error, setError] = useState('')
  const dragIndex = useRef(null)

  const loadPhotos = async () => {
    setLoading(true)
    const { data, error: fetchError } = await supabase
      .from('photos')
      .select('*')
      .order('position', { ascending: true })
    if (fetchError) setError(fetchError.message)
    else setPhotos(data || [])
    setLoading(false)
  }

  useEffect(() => {
    loadPhotos()
  }, [])

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setUploading(true)
    setError('')

    let nextPosition = photos.length
      ? Math.max(...photos.map((p) => p.position)) + 1
      : 0

    try {
      for (const file of files) {
        const cleanCategory = category.trim() || 'uncategorized'
        const storagePath = `${safePathPart(cleanCategory)}/${crypto.randomUUID()}-${safePathPart(file.name)}`

        const { error: uploadError } = await supabase.storage
          .from('photos')
          .upload(storagePath, file)

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
    const { error: deleteError } = await supabase.from('photos').delete().eq('id', photo.id)
    if (deleteError) {
      setError(deleteError.message)
      return
    }
    // Only remove the file once the row is gone, so the gallery never points at a missing file.
    const { error: removeError } = await supabase.storage
      .from('photos')
      .remove([photo.storage_path])
    // The photo is already gone from the gallery; just report the leftover file.
    if (removeError) setError(`Photo removed, but its file was not deleted: ${removeError.message}`)
    setPhotos((prev) => prev.filter((p) => p.id !== photo.id))
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
    const { error: updateError } = await supabase
      .from('photos')
      .update({ category: cleanCategory })
      .eq('id', photo.id)
    if (updateError) setError(updateError.message)
  }

  const handleDragStart = (index) => {
    dragIndex.current = index
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleDrop = async (index) => {
    const from = dragIndex.current
    dragIndex.current = null
    if (from === null || from === index) return

    const reordered = [...photos]
    const [moved] = reordered.splice(from, 1)
    reordered.splice(index, 0, moved)
    setPhotos(reordered)

    // Positions are rewritten as 0..n-1 for every photo, which also closes
    // gaps left behind by deleted photos.
    const results = await Promise.all(
      reordered.map((photo, i) =>
        supabase.from('photos').update({ position: i }).eq('id', photo.id),
      ),
    )
    const failed = results.find((result) => result.error)
    if (failed) {
      setError(`Could not save the new order: ${failed.error.message}`)
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
            hidden
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
            onDragStart={() => handleDragStart(index)}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(index)}
          >
            <img src={photo.url} alt="" loading="lazy" decoding="async" />
            <input
              type="text"
              className="admin-card-category"
              aria-label="Photo category"
              value={photo.category}
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
