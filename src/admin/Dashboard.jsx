import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabaseClient.js'

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
    else setPhotos(data)
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

    for (const file of files) {
      const cleanCategory = category.trim() || 'uncategorized'
      const storagePath = `${cleanCategory}/${crypto.randomUUID()}-${file.name}`

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

      if (insertError) setError(insertError.message)
      nextPosition += 1
    }

    setUploading(false)
    e.target.value = ''
    loadPhotos()
  }

  const handleDelete = async (photo) => {
    if (!confirm('Delete this photo?')) return
    await supabase.storage.from('photos').remove([photo.storage_path])
    await supabase.from('photos').delete().eq('id', photo.id)
    setPhotos((prev) => prev.filter((p) => p.id !== photo.id))
  }

  const handleCategoryChange = async (photo, newCategory) => {
    setPhotos((prev) =>
      prev.map((p) => (p.id === photo.id ? { ...p, category: newCategory } : p)),
    )
    await supabase.from('photos').update({ category: newCategory }).eq('id', photo.id)
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

    await Promise.all(
      reordered.map((photo, i) =>
        supabase.from('photos').update({ position: i }).eq('id', photo.id),
      ),
    )
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

      {error && <p className="admin-error">{error}</p>}

      {loading ? (
        <p>Loading photos…</p>
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
            <img src={photo.url} alt="" />
            <input
              type="text"
              className="admin-card-category"
              value={photo.category}
              onChange={(e) => handleCategoryChange(photo, e.target.value)}
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
