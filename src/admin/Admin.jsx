import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient.js'
import Login from './Login.jsx'
import Dashboard from './Dashboard.jsx'
import './admin.css'

function Admin() {
  const [session, setSession] = useState(undefined)

  // index.html carries the public site title; name the tab after the admin
  // panel so it is easy to tell apart from the portfolio.
  useEffect(() => {
    document.title = 'Photo Admin — Mirian Tsartsidze'
  }, [])

  useEffect(() => {
    if (!supabase) return

    // If the session check fails (e.g. offline), fall back to the login form
    // instead of showing "Loading…" forever.
    // onAuthStateChange below can report a sign-in or sign-out before this
    // first check resolves, so only use its result if nothing newer arrived.
    const setInitial = (initial) =>
      setSession((current) => (current === undefined ? initial : current))
    supabase.auth
      .getSession()
      .then(({ data }) => setInitial(data.session))
      .catch(() => setInitial(null))

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  if (!supabase) {
    return (
      <div className="admin-shell admin-center">
        <p className="admin-error" role="alert">
          Supabase is not configured — see .env.example.
        </p>
      </div>
    )
  }

  if (session === undefined) {
    return (
      <div className="admin-shell admin-center">
        <p role="status">Loading…</p>
      </div>
    )
  }

  return (
    <div className="admin-shell">
      {session ? <Dashboard /> : <Login />}
    </div>
  )
}

export default Admin
