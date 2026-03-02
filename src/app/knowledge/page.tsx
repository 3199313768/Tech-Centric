import { createClient } from '@/lib/supabase/server'
import { SearchBar } from '@/components/knowledge/SearchBar'
import { RecordCard } from '@/components/knowledge/RecordCard'
import { LoginForm } from '@/components/knowledge/LoginForm'

export const metadata = {
  title: 'Knowledge Base',
  description: 'Personal fragmented knowledge and snippets',
}

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function KnowledgePage({ searchParams }: PageProps) {
  const supabase = await createClient()

  // Verify auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    // Show login form if not authenticated
    return (
      <div className="min-h-screen py-24 flex items-center justify-center bg-zinc-950 px-4">
        <LoginForm />
      </div>
    )
  }

  // Parse search params
  const resolvedParams = await searchParams
  const query = typeof resolvedParams.q === 'string' ? resolvedParams.q : undefined
  const tagsFilter = typeof resolvedParams.tags === 'string' ? resolvedParams.tags.split(',') : []
  const typeFilter = typeof resolvedParams.type === 'string' ? resolvedParams.type : undefined

  // Build Supabase Query
  let dbQuery = supabase
    .from('kb_records')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (query) {
    dbQuery = dbQuery.textSearch('content', query, {
      type: 'websearch'
    })
  }

  if (tagsFilter.length > 0) {
    dbQuery = dbQuery.contains('tags', tagsFilter)
  }
  
  if (typeFilter) {
    dbQuery = dbQuery.eq('type', typeFilter)
  }

  const { data: records, error } = await dbQuery.limit(50)

  // Get all unique tags for the sidebar/filter (simple implementation, ideally requires a backend RPC or grouped query)
  // Here we just extract from the recent 100 records for the MVP Tag Cloud
  const { data: recentRecordsForTags } = await supabase
    .from('kb_records')
    .select('tags')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(100)
    
  const uniqueTags = Array.from(new Set(recentRecordsForTags?.flatMap(r => r.tags) || []))

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="mb-12 space-y-4">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-100">
            碎片知识库
          </h1>
          <p className="text-zinc-400 font-mono text-sm">
            Press <kbd className="px-1.5 py-0.5 border border-zinc-700 rounded-md bg-zinc-800 text-xs">Cmd</kbd> + <kbd className="px-1.5 py-0.5 border border-zinc-700 rounded-md bg-zinc-800 text-xs">K</kbd> anywhere to start drafting.
          </p>
        </div>

        {/* Toolbar Section */}
        <div className="mb-10">
          <SearchBar initialQuery={query} initialTags={tagsFilter} initialType={typeFilter} />
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content Area (Masonry-like layout) */}
          <main className="flex-1 min-w-0">
             {error ? (
                <div className="text-red-400 p-4 border border-red-900/30 bg-red-950/20 rounded-xl">
                  Error loading records: {error.message}
                </div>
              ) : records?.length === 0 ? (
                <div className="py-24 text-center text-zinc-500 flex flex-col items-center justify-center border border-dashed border-zinc-800 rounded-2xl">
                  <span className="text-4xl mb-4">📭</span>
                  <p>没有找到相关记录</p>
                </div>
              ) : (
                <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
                  {records?.map((record: any) => (
                    <RecordCard key={record.id} record={record} />
                  ))}
                </div>
             )}
          </main>

          {/* Sidebar / Options (Optional Tag Cloud) */}
          <aside className="w-full lg:w-64 shrink-0 mt-8 lg:mt-0 lg:pl-6 lg:border-l lg:border-zinc-800/50">
             <div className="sticky top-8">
               <h3 className="text-sm font-semibold tracking-wider text-zinc-500 uppercase mb-4">常用标签</h3>
               <div className="flex flex-wrap gap-2">
                 {uniqueTags.length > 0 ? (uniqueTags as string[]).map(tag => {
                    const isActive = tagsFilter.includes(tag)
                    // We generate a URL adding/removing the tag from current selection
                    // Here we simply use a client-directed approach in the Tag logic or a standard link
                    // MVP: just passing to standard search bar logic (TagCloud component)
                    return (
                        <span 
                           key={tag}
                           className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer transition-colors border ${
                             isActive 
                               ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' 
                               : 'bg-zinc-800 text-zinc-400 border-transparent hover:bg-zinc-700'
                           }`}
                        >
                          #{tag}
                        </span>
                    )
                 }) : (
                   <span className="text-zinc-600 text-sm">暂无标签记录</span>
                 )}
               </div>
             </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
