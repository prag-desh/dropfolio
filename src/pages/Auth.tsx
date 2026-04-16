import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { signUp, signIn } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password, username)
        if (error) {
          setError(error.message)
        } else {
          navigate('/')
        }
      } else {
        const { error } = await signIn(email, password)
        if (error) {
          setError(error.message)
        } else {
          navigate('/')
        }
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg-terminal flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-12">
          <div className="terminal-boot-line mb-2">$ dropfolio --auth</div>
          <div className="terminal-boot-line" style={{ animationDelay: '0.3s' }}>
            $ {isSignUp ? 'create_account' : 'login'} --session
          </div>
        </div>

        <div className="terminal-card">
          <form onSubmit={handleSubmit} className="space-y-6">
            {isSignUp && (
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <span className="terminal-prompt">{'>'}</span>
                  <label className="terminal-command">username:</label>
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="terminal-input w-full"
                  required
                  placeholder="username"
                />
              </div>
            )}

            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="terminal-prompt">{'>'}</span>
                <label className="terminal-command">email:</label>
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="terminal-input w-full"
                required
                placeholder="user@domain.com"
              />
            </div>

            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="terminal-prompt">{'>'}</span>
                <label className="terminal-command">password:</label>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="terminal-input w-full"
                required
                placeholder="********"
                minLength={6}
              />
            </div>

            {error && (
              <div className="text-terminal-red font-mono text-sm bg-bg-surface border border-terminal-red/30 p-3">
                error: {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-terminal w-full disabled:opacity-50 disabled:cursor-not-allowed cursor-blink"
            >
              {'>'} {isSignUp ? 'register' : 'login'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="terminal-cyan font-mono text-sm hover:text-matrix-green transition-colors"
            >
              {'>'} {isSignUp 
                ? 'already_have_account --signin' 
                : 'create_account --register'
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Auth
