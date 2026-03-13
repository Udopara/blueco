import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="navbar bg-base-100 border-b border-base-300 px-4">
      <div className="navbar-start">
        <Link to="/" className="text-xl font-bold text-primary">BlueCo</Link>
      </div>

      <div className="navbar-center hidden lg:flex">
        {profile?.role === 'worker' && (
          <ul className="menu menu-horizontal gap-1 px-1">
            <li><Link to="/">Jobs</Link></li>
            <li><Link to="/applications">My Applications</Link></li>
            <li><Link to="/saved-jobs">Saved</Link></li>
          </ul>
        )}
        {profile?.role === 'employer' && (
          <ul className="menu menu-horizontal gap-1 px-1">
            <li><Link to="/dashboard">Dashboard</Link></li>
            <li><Link to="/jobs/new">Post a Job</Link></li>
          </ul>
        )}
      </div>

      <div className="navbar-end gap-2">
        {user ? (
          <>
            <Link to="/notifications" className="btn btn-ghost btn-circle">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </Link>
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar placeholder">
                <div className="bg-primary text-primary-content rounded-full w-9">
                  <span className="text-sm">{profile?.full_name?.[0] ?? '?'}</span>
                </div>
              </div>
              <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
                <li className="menu-title px-4 py-2 text-sm font-medium">{profile?.full_name}</li>
                <li>
                  <Link to={profile?.role === 'employer' ? '/company' : '/profile'}>
                    Profile
                  </Link>
                </li>
                <li><button onClick={handleSignOut}>Sign out</button></li>
              </ul>
            </div>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-ghost btn-sm">Log in</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Sign up</Link>
          </>
        )}
      </div>
    </div>
  )
}
