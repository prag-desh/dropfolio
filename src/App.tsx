import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Drop from './pages/Drop'
import Profile from './pages/Profile'
import UserProfile from './pages/UserProfile'
import Auth from './pages/Auth'
import { useAuth } from './contexts/AuthContext'

function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-gray-100">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/drop" element={user ? <Drop /> : <Navigate to="/auth" />} />
        <Route path="/profile" element={user ? <Profile /> : <Navigate to="/auth" />} />
        <Route path="/u/:username" element={<UserProfile />} />
        <Route path="/auth" element={<Auth />} />
      </Routes>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  )
}

export default App
