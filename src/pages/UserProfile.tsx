import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase, Profile, Project } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

const UserProfile = () => {
  const { username } = useParams<{ username: string }>()
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set())
  const [comments, setComments] = useState<{ [projectId: string]: any[] }>({})
  const [commentInputs, setCommentInputs] = useState<{ [projectId: string]: string }>({})
  const [linkModal, setLinkModal] = useState<{ url: string; username: string } | null>(null)

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

    // First get the user by username to get their user_id
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .single()

    if (profileError) {
      console.error('Error fetching user profile:', profileError)
      setLoading(false)
      return
    }

    // Then get projects by user_id
    const { data: projectsData, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', profileData.id)
      .order('created_at', { ascending: false })

    if (projectsError) {
      console.error('Error fetching projects:', projectsError)
    } else {
      setProjects(projectsData || [])
    }
    setLoading(false)
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

  const handleOpenLink = (url: string, username: string) => {
    setLinkModal({ url, username })
  }

  const handleProceedToLink = () => {
    if (linkModal) {
      window.open(linkModal.url, '_blank', 'noopener,noreferrer')
      setLinkModal(null)
    }
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
      <div className="min-h-screen bg-bg-terminal flex items-center justify-center">
        <div className="w-full max-w-6xl mx-auto px-6 py-8">
          <div className="terminal-card">
            <div className="terminal-boot-line mb-6">$ whoami</div>
            <div className="ml-4 space-y-2">
              <div className="flex items-center space-x-4">
                <span className="text-muted font-mono text-sm">status:</span>
                <span className="text-red-400 font-mono font-semibold">
                  user is terminated
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-muted font-mono text-sm">reason:</span>
                <span className="terminal-output font-mono text-sm">
                  account not found or has been deleted
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-muted font-mono text-sm">action:</span>
                <span className="terminal-output font-mono text-sm">
                  return to terminal
                </span>
              </div>
            </div>
            
            <div className="mt-8">
              <Link to="/" className="btn-terminal text-sm">
                {'>'} return --home
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-terminal overflow-y-auto flex items-center justify-center">
      <div className="w-full max-w-6xl mx-auto px-6 py-8">
        {/* Profile Header - Terminal whoami style */}
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
              <span className="text-muted font-mono text-sm">bio:</span>
              <span className="terminal-output font-mono text-sm">
                {profile?.bio || '--'}
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
              <span className="text-muted font-mono text-sm">joined:</span>
              <span className="terminal-output font-mono text-sm">
                {new Date(profile?.created_at || '').toISOString().split('T')[0]}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-muted font-mono text-sm">projects:</span>
              <span className="terminal-output font-mono text-sm">
                {projects.length}
              </span>
            </div>
          </div>
        </div>

        {/* Projects Section */}
        <div>
          <div className="terminal-boot-line mb-6">$ ls projects</div>
          
          {projects.length === 0 ? (
            <div className="terminal-card text-center py-12">
              <p className="terminal-output mb-4">no projects found.</p>
              <p className="terminal-output mb-6">@{profile.username} hasn't dropped any projects yet!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {projects.map((project, index) => (
                <div key={project.id} style={{ animationDelay: `${index * 0.1}s` }} className="animate-fade-in">
                  <div className="terminal-card">
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
                      <button
                        onClick={() => handleOpenLink(project.deployed_url, profile?.username || 'user')}
                        className="btn-terminal text-xs"
                      >
                        [ open ]
                      </button>
                      <button
                        onClick={() => toggleComments(project.id)}
                        className="btn-terminal text-xs"
                      >
                        [{ expandedComments.has(project.id) ? 'collapse' : 'dataflow' } ]
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
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* External Link Confirmation Modal */}
      {linkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="terminal-card max-w-md w-full mx-4">
            <div className="terminal-boot-line mb-4">$ warning: external link</div>
            <div className="terminal-output mb-4">
              <div className="mb-2">{'>'} you are about to leave dropfolio</div>
              <div className="mb-2">{'>'} destination: {linkModal.url}</div>
              <div className="mb-4">{'>'} this link was posted by @{linkModal.username}</div>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={handleProceedToLink}
                className="btn-terminal text-sm"
              >
                [ {'>'} proceed ]
              </button>
              <button
                onClick={() => setLinkModal(null)}
                className="btn-terminal text-sm"
              >
                [ cancel ]
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserProfile
