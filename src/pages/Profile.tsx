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
    username: '',
    college: '',
    instagram_url: '',
    github_url: ''
  })
  const [linkModal, setLinkModal] = useState<{ url: string; username: string } | null>(null)

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
        username: data.username || '',
        college: (data as any).college || '',
        instagram_url: (data as any).instagram_url || '',
        github_url: data.github_url || ''
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
    const confirmed = window.confirm('Are you sure you want to delete this project?')
    if (!confirmed) return
    try {
      await supabase.from('comments').delete().eq('project_id', projectId)
      const { error } = await supabase.from('projects').delete().eq('id', projectId)
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
      if (error) { console.error('Error fetching comments:', error); return }
      const userIds = [...new Set(commentsData.map(c => c.user_id))]
      const { data: profilesData } = await supabase
        .from('profiles').select('id, username').in('id', userIds)
      const profileMap: { [key: string]: string } = {}
      if (profilesData) { profilesData.forEach(p => { profileMap[p.id] = p.username }) }
      const commentsWithUsernames = commentsData.map(c => ({
        ...c, username: profileMap[c.user_id] || 'unknown'
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
      const { error } = await supabase.from('comments').insert({
        project_id: projectId, user_id: user.id, content: commentText
      })
      if (error) { console.error('Error adding comment:', error); return }
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

  if (!user) return <div>Please log in</div>

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-terminal flex items-center justify-center">
        <div className="text-green-400 font-mono">$ loading profile...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-terminal overflow-y-auto flex items-center justify-center">
      <div className="w-full max-w-6xl mx-auto px-6 py-8">

        {/* whoami section */}
        <div className="terminal-card mb-6">
          <div className="terminal-boot-line mb-4">$ whoami</div>
          <div className="ml-2 font-mono text-sm mb-4 space-y-1">
            <div><span className="text-gray-500">username:</span> <span className="terminal-cyan">@{profile?.username || 'user'}</span></div>
            <div><span className="text-gray-500">github:</span>{' '}
              {profile?.github_url
                ? <a href={profile.github_url} target="_blank" rel="noopener noreferrer" className="terminal-cyan hover:underline">{profile.github_url}</a>
                : <span className="terminal-output">--</span>}
            </div>
            <div><span className="text-gray-500">joined:</span> <span className="terminal-output">{new Date(user.created_at).toISOString().split('T')[0]}</span></div>
            <div><span className="text-gray-500">projects:</span> <span className="terminal-output">{projects.length}</span></div>
          </div>

          {!editing ? (
            <button
              onClick={() => { setEditForm({ username: profile?.username || '', college: '', instagram_url: '', github_url: profile?.github_url || '' }); setEditing(true) }}
              className="btn-terminal text-sm"
            >
              {'>'} edit --profile
            </button>
          ) : (
            <div className="space-y-4 mt-4">
              <div>
                <label className="block text-sm font-mono text-gray-400 mb-1">{'>'} username:</label>
                <input type="text" value={editForm.username} onChange={(e) => setEditForm({...editForm, username: e.target.value})} className="terminal-input w-full" placeholder="username" />
              </div>
              <div>
                <label className="block text-sm font-mono text-gray-400 mb-1">{'>'} github_url:</label>
                <input type="url" value={editForm.github_url} onChange={(e) => setEditForm({...editForm, github_url: e.target.value})} className="terminal-input w-full" placeholder="https://github.com/username" />
              </div>
              <div className="flex space-x-3">
                <button onClick={handleSaveProfile} className="btn-terminal text-sm">[ {'>'} save ]</button>
                <button onClick={() => setEditing(false)} className="btn-terminal text-sm">[ cancel ]</button>
              </div>
            </div>
          )}
        </div>

        {/* Projects section */}
        <div>
          <div className="terminal-boot-line mb-4">$ ls projects</div>

          {projects.length === 0 ? (
            <div className="terminal-card text-center py-12">
              <p className="terminal-output mb-4">no projects found.</p>
              <p className="terminal-output mb-6">start by dropping your first project.</p>
              <Link to="/drop" className="btn-terminal">{'>'} drop project</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {projects.map((project, index) => (
                <div key={project.id} style={{ animationDelay: `${index * 0.1}s` }} className="animate-fade-in">
                  <div className="terminal-card">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="terminal-prompt">{'>'}</span>
                      <h3 className="terminal-cyan font-mono font-semibold">{project.name}</h3>
                      <span className="terminal-flag">--{project.category.toLowerCase()}</span>
                      <span className="terminal-timestamp">[{new Date(project.created_at).toISOString().split('T')[0]}]</span>
                    </div>
                    <div className="ml-4 mb-3">
                      <p className="terminal-output text-sm">{project.description}</p>
                    </div>
                    <div className="ml-4 flex items-center space-x-4">
                      <button onClick={() => handleOpenLink(project.deployed_url, profile?.username || 'user')} className="btn-terminal text-xs">[ open ]</button>
                      <button onClick={() => toggleComments(project.id)} className="btn-terminal text-xs">
                        [{expandedComments.has(project.id) ? ' collapse ' : ' dataflow '}]
                      </button>
                      <button onClick={() => handleDeleteProject(project.id)} className="font-mono text-xs text-red-500 hover:text-red-400 border border-red-800 px-2 py-1 hover:border-red-500 transition-colors">[ delete ]</button>
                    </div>

                    {expandedComments.has(project.id) && (
                      <div className="ml-4 mt-4">
                        <div className="terminal-card">
                          <div className="terminal-boot-line mb-3">$ dataflow --project={project.name}</div>
                          <div className="terminal-output mb-3">{'─'.repeat(40)}</div>
                          <div className="space-y-3">
                            {comments[project.id]?.length > 0 ? comments[project.id].map((comment) => (
                              <div key={comment.id} className="mb-3">
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="terminal-prompt">{'>'}</span>
                                  <span className="terminal-cyan font-mono text-sm font-semibold">@{comment.username || 'anonymous'}</span>
                                  <span className="terminal-timestamp">[{new Date(comment.created_at).toISOString().split('T')[0]}]</span>
                                </div>
                                <div className="ml-4">
                                  <p className="terminal-output text-sm whitespace-pre-wrap">{comment.content}</p>
                                </div>
                              </div>
                            )) : (
                              <p className="terminal-output text-sm">$ no dataflow yet. start the conversation.</p>
                            )}
                          </div>
                          <div className="terminal-output mt-3 mb-3">{'─'.repeat(40)}</div>
                          <div className="terminal-boot-line mb-2">$ add_comment:</div>
                          <div className="flex items-center space-x-2">
                            <span className="terminal-prompt">{'>'}</span>
                            <input
                              type="text"
                              value={commentInputs[project.id] || ''}
                              onChange={(e) => setCommentInputs(prev => ({ ...prev, [project.id]: e.target.value }))}
                              placeholder="type your comment..."
                              className="terminal-input flex-1"
                              onKeyPress={(e) => { if (e.key === 'Enter') handleCommentSubmit(project.id) }}
                            />
                            <button onClick={() => handleCommentSubmit(project.id)} className="btn-terminal text-xs">[ {'>'} post ]</button>
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

export default Profile
