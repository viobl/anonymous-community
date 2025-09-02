import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import type { Database } from '@/lib/supabase'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { type } = await request.json()
    const { id } = await params

    if (type !== 'like') {
      return NextResponse.json(
        { error: 'Only like votes are supported' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data: thread, error: fetchError } = await supabase
      .from('threads')
      .select('likes')
      .eq('id', id)
      .single()

    if (fetchError) throw fetchError
    if (!thread) throw new Error('Thread not found')

    const updates = { likes: (thread.likes as number) + 1 }

    const { data, error } = await supabase
      .from('threads')
      .update(updates)
      .eq('id', id)
      .select()

    if (error) throw error

    return NextResponse.json(data[0])
  } catch (error) {
    console.error('Error voting on thread:', error)
    return NextResponse.json(
      { error: 'Failed to vote on thread' },
      { status: 500 }
    )
  }
}