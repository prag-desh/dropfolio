import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const Navbar = () => {
  const { user, signOut } = useAuth()
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  const getCurrentPath = () => {
    const pathMap: Record<string, string> = {
      '/': '~/dropfolio',
      '/drop': '~/dropfolio/drop',
      '/profile': '~/dropfolio/profile',
      '/auth': '~/dropfolio/auth',
    }
    return pathMap[location.pathname] || '~/dropfolio'
  }

  return (
    <>
      {/* Desktop Navigation - Terminal Title Bar */}
      <nav className="hidden md:flex terminal-titlebar fixed top-0 left-0 right-0 z-50">
        <div className="w-full flex justify-between items-center px-4">
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-green-400 font-mono font-bold text-lg hover:text-green-300 transition-colors">
              dropfolio
            </Link>
            <span className="terminal-path">{getCurrentPath()}</span>
          </div>
          
          <div className="flex items-center space-x-6">
            <Link
              to="/"
              className={`text-green-400 hover:text-green-300 transition-colors font-mono text-sm ${
                isActive('/') ? 'text-green-500' : ''
              }`}
            >
              home
            </Link>
            {user && (
              <Link
                to="/drop"
                className={`text-green-400 hover:text-green-300 transition-colors font-mono text-sm ${
                  isActive('/drop') ? 'text-green-500' : ''
                }`}
              >
                drop
              </Link>
            )}
            {user ? (
              <Link
                to="/profile"
                className={`text-green-400 hover:text-green-300 transition-colors font-mono text-sm ${
                  isActive('/profile') ? 'text-green-500' : ''
                }`}
              >
                profile
              </Link>
            ) : (
              <Link
                to="/auth"
                className="text-text-muted hover:text-terminal-cyan transition-colors font-mono text-sm"
              >
                auth
              </Link>
            )}
            {user && (
              <button
                onClick={signOut}
                className="btn-terminal-danger text-xs"
              >
                exit
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Navigation - Terminal Style */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 terminal-titlebar z-50">
        <div className="flex justify-around py-2">
          <Link
            to="/"
            className={`text-green-400 hover:text-green-300 transition-colors font-mono text-xs ${
              isActive('/') ? 'text-green-500' : ''
            }`}
          >
            <span className="text-lg">home</span>
          </Link>
          
          {user && (
            <Link
              to="/drop"
              className={`flex flex-col items-center p-2 text-green-400 hover:text-green-300 transition-colors font-mono text-xs ${
                isActive('/drop') ? 'text-green-500' : ''
              }`}
            >
              <span className="text-lg">drop</span>
            </Link>
          )}
          
          {user ? (
            <Link
              to="/profile"
              className={`flex flex-col items-center p-2 text-green-400 hover:text-green-300 transition-colors font-mono text-xs ${
                isActive('/profile') ? 'text-green-500' : ''
              }`}
            >
              <span className="text-lg">profile</span>
            </Link>
          ) : (
            <Link
              to="/auth"
              className="flex flex-col items-center p-2 text-text-muted hover:text-terminal-cyan transition-colors font-mono text-xs"
            >
              <span className="text-lg">auth</span>
            </Link>
          )}
        </div>
      </nav>

      {/* Mobile padding for fixed nav */}
      <div className="md:hidden h-12"></div>
    </>
  )
}

export default Navbar
