import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase, Profile, Project } from '../lib/supabase'

const Profile = () => {
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set())
  const [comments, setComments] = useState<{ [projectId: string]: any[] }>({})
  const [commentInputs, setCommentInputs] = useState<{ [projectId: string]: string }>({})
  const [editForm, setEditForm] = useState({
    bio: '',
    college: '',
    github_url: '',
    instagram_url: ''
  })

  useEffect(() => {
    if (user) {
      fetchProfile()
      fetchProjects()
    }
  }, [user])

  const fetchProfile = async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('Error fetching profile:', error)
    } else {
      setProfile(data)
      setEditForm({
        bio: data.bio || '',
        college: data.college || '',
        github_url: data.github_url || '',
        instagram_url: data.instagram_url || ''
      })
    }
  }

  const fetchProjects = async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching projects:', error)
    } else {
      setProjects(data || [])
    }
    setLoading(false)
  }

  const handleSaveProfile = async () => {
    if (!user) return

    const { error } = await supabase
      .from('profiles')
      .update(editForm)
      .eq('id', user.id)

    if (error) {
      console.error('Error updating profile:', error)
    } else {
      setEditing(false)
      fetchProfile()
    }
  }

  const handleDeleteProject = async (projectId: string) => {
    if (!user) return

    const confirmed = window.confirm('Are you sure you want to delete this project? This action cannot be undone.')
    if (!confirmed) return

    try {
      // Delete comments first
      await supabase
        .from('comments')
        .delete()
        .eq('project_id', projectId)

      // Then delete the project
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)

      if (error) {
        console.error('Error deleting project:', error)
      } else {
        fetchProjects()
      }
    } catch (error) {
      console.error('Error deleting project:', error)
    }
  }

  const fetchComments = async (projectId: string) => {
    try {
      const { data: commentsData, error } = await supabase
        .from('comments')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error fetching comments:', error)
        return
      }

      const userIds = [...new Set(commentsData.map(c => c.user_id))]

      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, username')
        .in('id', userIds)

      const profileMap: { [key: string]: string } = {}
      if (profilesData) {
        profilesData.forEach(p => { profileMap[p.id] = p.username })
      }

      const commentsWithUsernames = commentsData.map(c => ({
        ...c,
        username: profileMap[c.user_id] || 'unknown'
      }))

      setComments(prev => ({ ...prev, [projectId]: commentsWithUsernames }))
    } catch (error) {
      console.error('Error fetching comments:', error)
    }
  }

  const toggleComments = (projectId: string) => {
    setExpandedComments(prev => {
      const newSet = new Set(prev)
      if (newSet.has(projectId)) {
        newSet.delete(projectId)
      } else {
        newSet.add(projectId)
        fetchComments(projectId)
      }
      return newSet
    })
  }

  const handleCommentSubmit = async (projectId: string) => {
    const commentText = commentInputs[projectId]?.trim()
    if (!user || !commentText) return

    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          project_id: projectId,
          user_id: user.id,
          content: commentText
        })

      if (error) {
        console.error('Error adding comment:', error)
        return
      }

      setCommentInputs(prev => ({ ...prev, [projectId]: '' }))
      fetchComments(projectId)
    } catch (error) {
      console.error('Error adding comment:', error)
    }
  }

  if (!user) {
    return <div>Please log in</div>
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-gray-100">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-terminal">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Header - whoami command output */}
        <div className="terminal-card mb-12">
          <div className="terminal-boot-line mb-6">$ whoami</div>
          <div className="ml-4 space-y-2">
            <div className="flex items-center space-x-4">
              <span className="text-muted font-mono text-sm">username:</span>
              <span className="terminal-cyan font-mono font-semibold">
                @{profile?.username || 'user'}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-muted font-mono text-sm">college:</span>
              <span className="terminal-output font-mono text-sm">
                {profile?.college || '--'}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-muted font-mono text-sm">github:</span>
              {profile?.github_url ? (
                <a
                  href={profile.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="terminal-cyan font-mono text-sm hover:underline"
                >
                  {profile.github_url}
                </a>
              ) : (
                <span className="terminal-output font-mono text-sm">--</span>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-muted font-mono text-sm">instagram:</span>
              {profile?.instagram_url ? (
                <a
                  href={profile.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="terminal-cyan font-mono text-sm hover:underline"
                >
                  {profile.instagram_url}
                </a>
              ) : (
                <span className="terminal-output font-mono text-sm">--</span>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-muted font-mono text-sm">joined:</span>
              <span className="terminal-output font-mono text-sm">
                {new Date(user.created_at).toISOString().split('T')[0]}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-muted font-mono text-sm">projects:</span>
              <span className="terminal-output font-mono text-sm">
                {projects.length}
              </span>
            </div>
          </div>
          
          {!editing && (
            <div className="mt-6">
              <button
                onClick={() => setEditing(true)}
                className="btn-terminal text-sm"
              >
                {'>'} edit --profile
              </button>
            </div>
          )}

          {editing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
                <textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                  className="input-field w-full h-24 resize-none"
                  placeholder="Tell us about yourself..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">College</label>
                <input
                  type="text"
                  value={editForm.college}
                  onChange={(e) => setEditForm({...editForm, college: e.target.value})}
                  className="input-field w-full"
                  placeholder="Your college/university"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">GitHub URL</label>
                <input
                  type="url"
                  value={editForm.github_url}
                  onChange={(e) => setEditForm({...editForm, github_url: e.target.value})}
                  className="input-field w-full"
                  placeholder="https://github.com/username"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Instagram URL</label>
                <input
                  type="url"
                  value={editForm.instagram_url}
                  onChange={(e) => setEditForm({...editForm, instagram_url: e.target.value})}
                  className="input-field w-full"
                  placeholder="https://instagram.com/username"
                />
              </div>
              
              <div className="flex space-x-4">
                <button
                  onClick={handleSaveProfile}
                  className="btn-primary"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {profile?.bio && (
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-1">Bio</h3>
                  <p className="text-gray-100">{profile.bio}</p>
                </div>
              )}
              
              {profile?.college && (
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-1">College</h3>
                  <p className="text-gray-100">{profile.college}</p>
                </div>
              )}
              
              <div className="flex space-x-4">
                {profile?.github_url && (
                  <a
                    href={profile.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    GitHub
                  </a>
                )}
                {profile?.instagram_url && (
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
          )}
        </div>

        {/* Projects Section */}
        <div>
          <div className="terminal-boot-line mb-6">$ ls projects</div>
          
          {projects.length === 0 ? (
            <div className="terminal-card text-center py-12">
              <p className="terminal-output mb-4">no projects found.</p>
              <p className="terminal-output mb-6">start by dropping your first project.</p>
              <Link to="/drop" className="btn-terminal">
                {'>'} drop project
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {projects.map((project) => (
                <div key={project.id} className="terminal-card">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="terminal-prompt">{'>'}</span>
                    <h3 className="terminal-cyan font-mono font-semibold">
                      {project.name}
                    </h3>
                    <span className="terminal-flag">--{project.category.toLowerCase()}</span>
                    <span className="terminal-timestamp">[{new Date(project.created_at).toISOString().split('T')[0]}]</span>
                  </div>
                  
                  <div className="ml-4 mb-3">
                    <p className="terminal-output text-sm">
                      {project.description}
                    </p>
                  </div>
                  
                  <div className="ml-4 flex items-center space-x-4">
                    <a
                      href={project.deployed_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-terminal text-xs"
                    >
                      [ open ]
                    </a>
                    <button
                      onClick={() => toggleComments(project.id)}
                      className="btn-terminal text-xs"
                    >
                      [{ expandedComments.has(project.id) ? 'collapse' : 'dataflow' } ]
                    </button>
                    <button
                      onClick={() => handleDeleteProject(project.id)}
                      className="btn-terminal text-xs text-red-400 hover:text-red-300"
                    >
                      [ delete ]
                    </button>
                  </div>

                  {/* Inline Comments Section */}
                  {expandedComments.has(project.id) && (
                    <div className="ml-4 mt-4 animate-fade-in">
                      <div className="terminal-card">
                        <div className="terminal-boot-line mb-4">$ dataflow --project={project.name}</div>
                        <div className="terminal-output mb-4">{'\u2500'.repeat(64)}</div>
                        
                        {/* Comments List */}
                        <div className="space-y-3">
                          {comments[project.id]?.map((comment) => (
                            <div key={comment.id} className="mb-4">
                              <div className="flex items-center space-x-2 mb-2">
                                <span className="terminal-prompt">{'>'}</span>
                                <span className="terminal-cyan font-mono text-sm font-semibold">
                                  @{comment.username || 'anonymous'}
                                </span>
                                <span className="terminal-timestamp">[{new Date(comment.created_at).toISOString().split('T')[0]}]</span>
                              </div>
                              <div className="ml-4">
                                <p className="terminal-output text-sm whitespace-pre-wrap leading-relaxed">
                                  {comment.content}
                                </p>
                              </div>
                            </div>
                          )) || (
                            <div className="text-center py-8">
                              <p className="terminal-output font-mono text-sm">
                                $ no dataflow yet. start the conversation.
                              </p>
                            </div>
                          )}
                        </div>
                        
                        <div className="terminal-output mt-4">{'\u2500'.repeat(64)}</div>
                        <div className="terminal-boot-line mt-4 mb-4">$ add_comment:</div>
                        <div className="ml-4">
                          {user ? (
                            <div className="flex items-center space-x-2">
                              <span className="terminal-prompt">{'>'}</span>
                              <input
                                type="text"
                                value={commentInputs[project.id] || ''}
                                onChange={(e) => setCommentInputs(prev => ({ ...prev, [project.id]: e.target.value }))}
                                placeholder="[type your comment here...        ]"
                                className="terminal-input flex-1"
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter') {
                                    handleCommentSubmit(project.id)
                                  }
                                }}
                              />
                              <button 
                                onClick={() => handleCommentSubmit(project.id)}
                                className="btn-terminal text-xs"
                              >
                                [ {'>'} post ]
                              </button>
                            </div>
                          ) : (
                            <div className="terminal-output font-mono text-sm">
                              {'>'} login to join the dataflow
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Profile
