'use client'

import { useState, useEffect } from 'react'
import { supabase, type Thread } from '@/lib/supabase'
import { getAnonymousId, generateAnonymousName } from '@/lib/auth'
import PostList from '@/components/PostList'
import CreatePost from '@/components/CreatePost'


export default function Home() {
  const [threads, setThreads] = useState<Thread[]>([])
  const [loading, setLoading] = useState(true)
  const [anonymousId, setAnonymousId] = useState<string>('')

  useEffect(() => {
    setAnonymousId(getAnonymousId())
    fetchThreads()
  }, [])

  const fetchThreads = async () => {
    try {
      const { data, error } = await supabase
        .from('threads')
        .select('*')
        .is('parent_id', null)
        .order('created_at', { ascending: false })

      if (error) throw error
      setThreads(data || [])
    } catch (error) {
      console.error('Error fetching threads:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleThreadCreated = () => {
    fetchThreads()
  }

  return (
    <div className="min-h-screen bg-white dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950">
      {/* Modern Header with Glass Effect */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-b border-white/20 dark:border-gray-700/30">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                익명 커뮤니티
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2 flex items-center gap-2">
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-sm font-medium bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {generateAnonymousName(anonymousId)}
                </span>
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-white/30 dark:border-gray-600/30">
                <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-blue-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600 dark:text-gray-300">온라인</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <CreatePost onPostCreated={handleThreadCreated} />
        </div>
        
        <div>
          <PostList posts={threads} loading={loading} />
        </div>
      </main>
    </div>
  )
}
