import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'

import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ProtectedRoute, { WorkerRoute, EmployerRoute } from "./pages/auth/ProtectedRoute"

import JobFeed from './pages/worker/JobFeed'
import JobDetail from './pages/worker/JobDetail'
import Applications from './pages/worker/Applications'
import SavedJobs from './pages/worker/SavedJobs'
import WorkerProfile from './pages/worker/WorkerProfile'
import { useAuth } from './context/AuthContext'

import Dashboard from './pages/employer/Dashboard'
import PostJob from './pages/employer/PostJob'
import EditJob from './pages/employer/EditJob'
import JobApplications from './pages/employer/JobApplications'
import CompanyProfile from './pages/employer/CompanyProfile'
import Notifications from './pages/Notifications'

function ProfileRouter() {
  const { profile } = useAuth()
  return profile?.role === 'employer' ? <CompanyProfile /> : <WorkerProfile />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth — no layout */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* All other pages use shared layout with navbar */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            {/* Worker-only */}
            <Route element={<WorkerRoute />}>
              <Route path="/" element={<JobFeed />} />
              <Route path="/jobs/:id" element={<JobDetail />} />
              <Route path="/applications" element={<Applications />} />
              <Route path="/saved-jobs" element={<SavedJobs />} />
            </Route>

            {/* Employer-only */}
            <Route element={<EmployerRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/jobs/new" element={<PostJob />} />
              <Route path="/jobs/:id/edit" element={<EditJob />} />
              <Route path="/jobs/:id/applications" element={<JobApplications />} />
            </Route>

            {/* Shared — role-aware */}
            <Route path="/profile" element={<ProfileRouter />} />
            {/* Shared */}
            <Route path="/notifications" element={<Notifications />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
