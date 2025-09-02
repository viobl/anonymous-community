'use client'

import { useState, useEffect } from 'react'
import { supabase, type Thread } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import PostList from '@/components/PostList'
import CreatePost from '@/components/CreatePost'
import AuthModal from '@/components/AuthModal'

export default function Home() {
  const [threads, setThreads] = useState<Thread[]>([])
  const [loading, setLoading] = useState(true)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login')

  const { user, profile, signOut } = useAuth()

  useEffect(() => {
    fetchThreads()
  }, [])

  const fetchThreads = async () => {
    // Skip if running on server side or missing env vars
    if (typeof window === 'undefined' || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('threads')
        .select(`
          *,
          user_profiles (
            anonymous_name
          )
        `)
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
              {user && profile ? (
                <p className="text-gray-600 dark:text-gray-300 mt-2 flex items-center gap-2">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="text-sm font-medium bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    {profile.anonymous_name}
                  </span>
                </p>
              ) : (
                <p className="text-gray-600 dark:text-gray-300 mt-2 text-sm">
                  익명으로 소통하는 안전한 공간
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              {user ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-white/30 dark:border-gray-600/30">
                    <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-300">온라인</span>
                  </div>
                  <button
                    onClick={() => signOut()}
                    className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 border border-gray-300/50 dark:border-gray-600/50 rounded-xl hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-all duration-200"
                  >
                    로그아웃
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setAuthModalMode('login')
                      setAuthModalOpen(true)
                    }}
                    className="px-4 py-2 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-colors"
                  >
                    로그인
                  </button>
                  <button
                    onClick={() => {
                      setAuthModalMode('register')
                      setAuthModalOpen(true)
                    }}
                    className="px-4 py-2 text-sm bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/25"
                  >
                    회원가입
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          {user ? (
            <CreatePost onPostCreated={handleThreadCreated} />
          ) : (
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-white/30 dark:border-gray-700/30 p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                로그인이 필요합니다
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                스레드를 작성하려면 회원가입 후 로그인해주세요.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => {
                    setAuthModalMode('register')
                    setAuthModalOpen(true)
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/25"
                >
                  회원가입
                </button>
                <button
                  onClick={() => {
                    setAuthModalMode('login')
                    setAuthModalOpen(true)
                  }}
                  className="px-6 py-3 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-700/50 rounded-xl font-semibold hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 transition-all duration-200"
                >
                  로그인
                </button>
              </div>
            </div>
          )}
        </div>
        
        <div>
          <PostList posts={threads} loading={loading} />
        </div>
      </main>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
      />
    </div>
  )
}
