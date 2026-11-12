import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Admin from './admin/Admin.jsx'

// There is no router: the admin panel is shown when the path ends in /admin
// (trailing slashes ignored); everything else renders the public site.
const isAdmin = window.location.pathname.replace(/\/+$/, '').endsWith('/admin')

createRoot(document.getElementById('root')).render(
  <StrictMode>{isAdmin ? <Admin /> : <App />}</StrictMode>,
)
