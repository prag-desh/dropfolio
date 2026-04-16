import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { supabase, Project, Comment } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

const ProjectCard = ({ project, onToggleComments, isExpanded }: { project: Project; onToggleComments: (id: string) => void; isExpanded: boolean }) => {
  return (
    <div className="terminal-card cursor-pointer group">
      <div className="mb-3">
        <div className="flex items-center space-x-2">
          <span className="terminal-prompt">{'>'}</span>
          <h3 className="terminal-cyan font-mono font-semibold">
            {project.name}
          </h3>
        </div>
        <div className="flex items-center space-x-3 mt-2">
          <span className="terminal-flag">--{project.category.toLowerCase()}</span>
          <span className="terminal-timestamp">[{new Date(project.created_at).toISOString().split('T')[0]}]</span>
        </div>
      </div>
      
      <div className="ml-4 mb-4">
        <p className="terminal-output text-sm">
          {project.description}
        </p>
      </div>
      
      <div className="flex items-center justify-between ml-4">
        <div className="flex items-center space-x-2">
          <span className="text-gray-500 font-mono text-sm">author:</span>
          <Link 
            to={`/u/${project.username || 'user'}`}
            className="terminal-cyan font-mono text-sm hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            @{project.username || 'user'}
          </Link>
        </div>
        
        <div className="flex space-x-2">
          <a
            href={project.deployed_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="btn-terminal text-xs"
          >
            [ open ]
          </a>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggleComments(project.id)
            }}
            className="btn-terminal text-xs"
          >
            [{ isExpanded ? 'collapse' : 'dataflow' } ]
          </button>
        </div>
      </div>
    </div>
  )
}

const Home = () => {
  const { user } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(0)
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set())
  const [comments, setComments] = useState<{ [projectId: string]: Comment[] }>({})
  const [commentInputs, setCommentInputs] = useState<{ [projectId: string]: string }>({})

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

  const fetchProjects = useCallback(async (pageNum: number, isInitial = false) => {
    try {
      const pageSize = 10
      const from = pageNum * pageSize
      const to = from + pageSize - 1

      const { data: projectsData, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })
        .range(from, to)

      if (error) {
        console.error('Projects fetch error:', error)
        return
      }

      const userIds = [...new Set(projectsData.map(p => p.user_id))]

      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, username')
        .in('id', userIds)

      const profileMap: { [key: string]: string } = {}
      if (profilesData) {
        profilesData.forEach(p => { profileMap[p.id] = p.username })
      }

      const projectsWithUsernames = projectsData.map(p => ({
        ...p,
        username: profileMap[p.user_id] || 'unknown'
      }))

      console.log('Projects fetched:', projectsWithUsernames?.length || 0, 'projects')

      if (isInitial) {
        setProjects(projectsWithUsernames || [])
        setLoading(false)
      } else {
        setProjects(prev => [...prev, ...(projectsWithUsernames || [])])
      }

      setHasMore((projectsWithUsernames?.length || 0) === pageSize)
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProjects(0, true)
  }, [fetchProjects])


  // Test Supabase connection

  
  const loadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchProjects(nextPage, false)
  }

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop >= 
          document.documentElement.offsetHeight - 1000) {
        if (!loading && hasMore) {
          loadMore()
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [loading, hasMore, page])

  return (
    <div className="min-h-screen bg-bg-terminal">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Terminal Boot Screen */}
        <div className="mb-12">
          <div className="terminal-boot-line">$ initializing dropfolio...</div>
          <div className="terminal-boot-line" style={{ animationDelay: '0.5s' }}>$ loading vibe coder community...</div>
          <div className="terminal-boot-line" style={{ animationDelay: '1s' }}>$ {projects.length.toLocaleString()} projects found. ready.</div>
        </div>

        {loading && projects.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-matrix-green font-mono animate-pulse">$ fetching projects...</div>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20">
            <div className="terminal-card max-w-md mx-auto">
              <div className="terminal-boot-line mb-4">$ ls projects</div>
              <p className="terminal-output mb-4">no projects found.</p>
              <p className="terminal-output mb-6">be the first to drop a project.</p>
              <Link to="/drop" className="btn-terminal">
                [ drop project ]
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="terminal-boot-line mb-4">$ ls projects</div>
            <div className="space-y-3">
              {projects.map((project, index) => (
                <div key={project.id} style={{ animationDelay: `${index * 0.1}s` }} className="animate-fade-in">
                  <ProjectCard 
                      project={project} 
                      onToggleComments={toggleComments}
                      isExpanded={expandedComments.has(project.id)}
                    />
                  
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
          </div>
        )}

        {loading && projects.length > 0 && (
          <div className="flex justify-center mt-12">
            <div className="text-matrix-green font-mono animate-pulse">$ fetching more projects...</div>
          </div>
        )}

        {!hasMore && projects.length > 0 && (
          <div className="text-center mt-12">
            <p className="text-muted font-mono">$ end of project list</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Home
