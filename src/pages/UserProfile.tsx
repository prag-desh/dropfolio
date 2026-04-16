import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase, Profile, Project } from '../lib/supabase'

const UserProfile = () => {
  const { username } = useParams<{ username: string }>()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (username) {
      fetchProfile()
      fetchProjects()
    }
  }, [username])

  const fetchProfile = async () => {
    if (!username) return

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', username)
      .single()

    if (error) {
      console.error('Error fetching profile:', error)
    } else {
      setProfile(data)
    }
  }

  const fetchProjects = async () => {
    if (!username) return

    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        profiles!inner (
          username
        )
      `)
      .eq('profiles.username', username)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching projects:', error)
    } else {
      setProjects(data || [])
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-gray-100">Loading profile...</div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-100 mb-4">User not found</h1>
          <Link to="/" className="btn-primary">
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Profile Header */}
        <div className="card mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {profile.username[0].toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-100">
                @{profile.username}
              </h1>
              <p className="text-gray-400">Member since {new Date(profile.created_at).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="space-y-3">
            {profile.bio && (
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-1">Bio</h3>
                <p className="text-gray-100">{profile.bio}</p>
              </div>
            )}
            
            {profile.college && (
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-1">College</h3>
                <p className="text-gray-100">{profile.college}</p>
              </div>
            )}
            
            <div className="flex space-x-4">
              {profile.github_url && (
                <a
                  href={profile.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300 transition-colors"
                >
                  GitHub
                </a>
              )}
              {profile.instagram_url && (
                <a
                  href={profile.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300 transition-colors"
                >
                  Instagram
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Projects Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-100 mb-6">
            Projects ({projects.length})
          </h2>
          
          {projects.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-gray-400">
                @{profile.username} hasn't dropped any projects yet!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.map((project) => (
                <div key={project.id} className="card hover:border-purple-600 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-gray-100">
                      {project.name}
                    </h3>
                    <span className="px-2 py-1 bg-purple-600/20 text-purple-400 text-xs rounded-full">
                      {project.category}
                    </span>
                  </div>
                  
                  <p className="text-gray-400 text-sm mb-4">
                    {project.description}
                  </p>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-sm">
                      {new Date(project.created_at).toLocaleDateString()}
                    </span>
                    
                    <div className="space-x-2">
                      <a
                        href={project.deployed_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary text-sm py-1 px-3"
                      >
                        View Project
                      </a>
                      <Link
                        to={`/project/${project.id}`}
                        className="btn-secondary text-sm py-1 px-3"
                      >
                        Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default UserProfile
