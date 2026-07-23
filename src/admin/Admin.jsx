import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient.js'
import Login from './Login.jsx'
import Dashboard from './Dashboard.jsx'
import './admin.css'

function Admin() {
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  if (session === undefined) {
    return (
      <div className="admin-shell admin-center">
        <p>Loading…</p>
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
