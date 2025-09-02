'use client'

import { useState } from 'react'
import { supabase, type Thread } from '@/lib/supabase'

interface PostListProps {
  posts: Thread[]
  loading: boolean
}

export default function PostList({ posts, loading }: PostListProps) {
  const [votingStates, setVotingStates] = useState<{ [key: string]: boolean }>({})

  const handleLike = async (threadId: string) => {
    if (votingStates[threadId]) return

    setVotingStates(prev => ({ ...prev, [threadId]: true }))

    try {
      const thread = posts.find(p => p.id === threadId)
      if (!thread) return

      const { error } = await supabase
        .from('threads')
        .update({ likes: thread.likes + 1 })
        .eq('id', threadId)

      if (error) throw error

      window.location.reload()
    } catch (error) {
      console.error('Error liking thread:', error)
    } finally {
      setVotingStates(prev => ({ ...prev, [threadId]: false }))
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gradient-to-r from-indigo-500 to-purple-600 border-t-transparent"></div>
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 opacity-20 animate-pulse"></div>
        </div>
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="mx-auto w-24 h-24 mb-6 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 flex items-center justify-center">
          <svg className="w-12 h-12 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">아직 게시글이 없습니다</h3>
        <p className="text-gray-500 dark:text-gray-400">첫 번째 이야기를 공유해보세요!</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {posts.map((post, index) => (
        <div
          key={post.id}
          className="group bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-gray-700/30 p-6 hover:bg-white/90 dark:hover:bg-gray-800/90 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1"
          style={{
            animationDelay: `${index * 100}ms`
          }}
        >
          {/* Thread Header */}
          <div className="flex items-center gap-3 text-sm mb-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-600 text-white font-medium">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              {post.visibility_type === 'nickname' ? '사용자' : '익명'}
              {post.visibility_type === 'anonymous' && (
                <span className="text-xs opacity-75 ml-1">🎭</span>
              )}
            </div>
            <span className="text-gray-500 dark:text-gray-400">•</span>
            <span className="text-gray-600 dark:text-gray-300 bg-gray-100/80 dark:bg-gray-700/50 px-2 py-1 rounded-lg text-xs">
              {formatDate(post.created_at)}
            </span>
          </div>

          {/* Thread Content */}
          <div className="mb-6">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
              {post.content}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200/50 dark:border-gray-600/30">
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleLike(post.id)}
                disabled={votingStates[post.id]}
                className="group/btn flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-400/20 to-purple-400/20 hover:from-indigo-400/30 hover:to-purple-400/30 text-indigo-700 dark:text-indigo-300 hover:text-indigo-800 dark:hover:text-indigo-200 transition-all duration-200 border border-indigo-200/50 dark:border-indigo-700/30 hover:border-indigo-300/70 dark:hover:border-indigo-600/50 hover:shadow-lg hover:shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
              >
                <span className="text-lg group-hover/btn:scale-110 transition-transform">❤️</span>
                <span className="font-semibold">{post.likes}</span>
              </button>
              <button className="group/btn flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-gray-400/20 to-slate-400/20 hover:from-gray-400/30 hover:to-slate-400/30 text-gray-700 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-200 transition-all duration-200 border border-gray-200/50 dark:border-gray-700/30 hover:border-gray-300/70 dark:hover:border-gray-600/50 hover:shadow-lg hover:shadow-gray-500/20 hover:scale-105 active:scale-95">
                <span className="text-lg group-hover/btn:scale-110 transition-transform">💬</span>
                <span className="font-semibold">{post.reply_count || 0}</span>
              </button>
            </div>
            
            {/* Thread Stats */}
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-indigo-400 to-purple-500"></div>
              <span>참여: {post.likes}❤️ {post.reply_count}💬</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}