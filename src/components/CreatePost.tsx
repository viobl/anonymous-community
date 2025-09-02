'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

interface CreatePostProps {
  onPostCreated: () => void
}

export default function CreatePost({ onPostCreated }: CreatePostProps) {
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [visibilityType, setVisibilityType] = useState<'anonymous' | 'nickname'>('anonymous')
  
  const { user } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!content.trim() || !user) return

    setIsSubmitting(true)

    try {
      const { error } = await supabase
        .from('threads')
        .insert([
          {
            content: content.trim(),
            user_id: user.id,
            parent_id: null,
            visibility_type: visibilityType
          }
        ])

      if (error) throw error

      setContent('')
      setVisibilityType('anonymous')
      setIsExpanded(false)
      onPostCreated()
    } catch (error) {
      console.error('Error creating thread:', error)
      alert('스레드 작성 중 오류가 발생했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isExpanded) {
    return (
      <div 
        onClick={() => setIsExpanded(true)}
        className="group bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-white/30 dark:border-gray-700/30 p-6 cursor-pointer hover:bg-white/80 dark:hover:bg-gray-800/80 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 hover:scale-[1.01]"
      >
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:rotate-3 transition-transform duration-300">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              새로운 스레드를 시작해보세요...
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              첫 줄에 요약을 쓰고 자유롭게 이야기해보세요 ✨
            </p>
          </div>
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-gray-400 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-white/30 dark:border-gray-700/30 p-8 shadow-xl shadow-indigo-500/10">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </div>
        <div>
          <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            새 스레드 시작
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">첫 줄에 요약을 쓰고 자유롭게 이야기해보세요</p>
        </div>
      </div>
      
      <div className="space-y-6">
        <div className="group">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">무엇을 공유하고 싶나요?</label>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full transition-colors ${
                content.length > 800 ? 'bg-red-400' : 
                content.length > 600 ? 'bg-yellow-400' : 
                'bg-green-400'
              }`}></div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {content.length}/1000
              </span>
            </div>
          </div>
          <textarea
            placeholder="첫 줄에 요약이나 제목을 쓰고, 이어서 자세한 내용을 작성해보세요...&#10;&#10;예:&#10;오늘 재미있는 일이 있었어요&#10;&#10;점심시간에 카페에서..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            className="w-full px-4 py-3 bg-white/50 dark:bg-gray-700/50 border border-gray-200/50 dark:border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 backdrop-blur-sm transition-all duration-200 hover:bg-white/70 dark:hover:bg-gray-700/70 resize-none"
            maxLength={1000}
            required
          />
        </div>

        <div className="group">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            공개 설정
          </label>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setVisibilityType('anonymous')}
              className={`flex-1 px-4 py-3 rounded-xl border transition-all duration-200 ${
                visibilityType === 'anonymous'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-indigo-500 shadow-lg shadow-indigo-500/25'
                  : 'bg-white/50 dark:bg-gray-700/50 border-gray-200/50 dark:border-gray-600/50 text-gray-700 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-700/70'
              }`}
            >
              <div className="text-center">
                <div className="text-lg mb-1">🎭</div>
                <div className="font-medium">익명</div>
                <div className="text-xs opacity-75">익명으로 작성</div>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setVisibilityType('nickname')}
              className={`flex-1 px-4 py-3 rounded-xl border transition-all duration-200 ${
                visibilityType === 'nickname'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-indigo-500 shadow-lg shadow-indigo-500/25'
                  : 'bg-white/50 dark:bg-gray-700/50 border-gray-200/50 dark:border-gray-600/50 text-gray-700 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-700/70'
              }`}
            >
              <div className="text-center">
                <div className="text-lg mb-1">👤</div>
                <div className="font-medium">닉네임</div>
                <div className="text-xs opacity-75">닉네임으로 작성</div>
              </div>
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200/30 dark:border-gray-600/30">
        <button
          type="submit"
          disabled={isSubmitting || !content.trim()}
          className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/25 hover:scale-[1.02] active:scale-[0.98]"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>게시 중...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              <span>게시하기</span>
            </div>
          )}
        </button>
        <button
          type="button"
          onClick={() => {
            setIsExpanded(false)
            setContent('')
            setVisibilityType('anonymous')
          }}
          className="px-6 py-3 text-gray-600 dark:text-gray-400 border border-gray-300/50 dark:border-gray-600/50 rounded-xl hover:bg-gray-50/50 dark:hover:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-gray-500/50 transition-all duration-200 backdrop-blur-sm font-medium hover:scale-[1.02] active:scale-[0.98]"
        >
          취소
        </button>
      </div>
    </form>
  )
}