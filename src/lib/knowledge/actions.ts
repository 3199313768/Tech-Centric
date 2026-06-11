'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { KbRecord } from '@/lib/knowledge/types'

export async function deleteKbRecord(recordId: string): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '未登录' }

  const { error } = await supabase
    .from('kb_records')
    .delete()
    .eq('id', recordId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/knowledge')
  return { error: null }
}

export interface UpdateKbRecordInput {
  content: string
  tags: string[]
  type: string
}

export async function updateKbRecord(
  recordId: string,
  input: UpdateKbRecordInput,
): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '未登录' }

  const { error } = await supabase
    .from('kb_records')
    .update({
      content: input.content,
      tags: input.tags,
      type: input.type,
    })
    .eq('id', recordId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/knowledge')
  return { error: null }
}

export async function createKbRecord(input: {
  type: string
  content: string
  tags: string[]
}): Promise<{ error: string | null; record?: KbRecord }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '未登录' }

  const { data, error } = await supabase
    .from('kb_records')
    .insert({
      user_id: user.id,
      type: input.type,
      content: input.content,
      tags: input.tags,
    })
    .select('*')
    .single()

  if (error) return { error: error.message }
  revalidatePath('/knowledge')
  return { error: null, record: data as KbRecord }
}
