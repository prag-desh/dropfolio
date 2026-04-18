import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

const Drop = () => {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Tech',
    description: '',
    deployed_url: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { user } = useAuth()
  const navigate = useNavigate()

  const categories = ['Tech', 'Health', 'Education', 'Finance', 'Entertainment', 'Productivity', 'Other']

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!user) {
      setError('You must be logged in to drop a project')
      setLoading(false)
      return
    }

    try {
      // Validate URL
      try {
        new URL(formData.deployed_url)
      } catch {
        setError('Please enter a valid URL')
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('projects')
        .insert({
          user_id: user.id,
          name: formData.name,
          category: formData.category,
          description: formData.description,
          deployed_url: formData.deployed_url
        })
        .select()

      if (error) {
        setError(error.message)
      } else {
        navigate('/')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <div className="min-h-screen bg-bg-terminal overflow-y-auto">
      <div className="max-w-2xl mx-auto px-4 pt-16 pb-8">
        <div>
          <div className="terminal-boot-line">$ drop --project</div>
          <div className="terminal-boot-line" style={{ animationDelay: '0.3s' }}>$ initializing deployment wizard...</div>
        </div>

        <div className="terminal-card">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="terminal-prompt">{'>'}</span>
                <label className="terminal-command">project_name:</label>
              </div>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="terminal-input w-full"
                required
                placeholder="my-awesome-project"
              />
            </div>

            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="terminal-prompt">{'>'}</span>
                <label className="terminal-command">category:</label>
              </div>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="terminal-input w-full"
                required
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category.toLowerCase()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="terminal-prompt">{'>'}</span>
                <label className="terminal-command">description:</label>
              </div>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="terminal-input w-full h-24 resize-none"
                required
                placeholder="brief description of your project..."
                maxLength={200}
              />
              <div className="text-right text-xs text-muted mt-1">
                [{formData.description.length}/200]
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="terminal-prompt">{'>'}</span>
                <label className="terminal-command">deployed_url:</label>
              </div>
              <input
                type="url"
                name="deployed_url"
                value={formData.deployed_url}
                onChange={handleChange}
                className="terminal-input w-full"
                required
                placeholder="https://myproject.vercel.app"
              />
            </div>

            {error && (
              <div className="text-terminal-red font-mono text-sm bg-bg-surface border border-terminal-red/30 p-3">
                error: {error}
              </div>
            )}

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={loading}
                className="btn-terminal flex-1 disabled:opacity-50 disabled:cursor-not-allowed cursor-blink"
              >
                {'>'} run deploy
              </button>
              
              <button
                type="button"
                onClick={() => navigate('/')}
                className="btn-terminal-danger flex-1"
              >
                {'>'} cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Drop
