import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

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

    // First get current likes count
    const { data: threadData, error: fetchError } = await supabase
      .from('threads')
      .select('likes')
      .eq('id', id)
      .single()

    if (fetchError || !threadData) {
      return NextResponse.json(
        { error: 'Thread not found' },
        { status: 404 }
      )
    }

    // Update with incremented likes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('threads')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .update({ likes: (threadData as any).likes + 1 })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error voting on thread:', error)
    return NextResponse.json(
      { error: 'Failed to vote on thread' },
      { status: 500 }
    )
  }
}