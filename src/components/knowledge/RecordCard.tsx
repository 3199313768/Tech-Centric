'use client'

import { useState, useEffect } from 'react'
import { FileText, Code2, Image as ImageIcon, Link as LinkIcon, ExternalLink, Calendar, Copy, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'

// minimal css for highlight js integration
import 'highlight.js/styles/github-dark.css'

interface RecordCardProps {
  record: any // using any for MVP, ideally should be inferred from Supabase database typing
}

export function RecordCard({ record }: RecordCardProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const supabase = createClient()

  // For image/file types we stored the path in 'content'. Let's fetch the signed URL.
  useEffect(() => {
    async function loadAssetUrl() {
      if (record.type === 'image' || record.type === 'file') {
        const { data, error } = await supabase.storage
          .from('kb_assets')
          .createSignedUrl(record.content, 60 * 60) // valid for 1 hour
        
        if (!error && data) {
          setImageUrl(data.signedUrl)
        } else {
          console.error("Failed to load asset URL: ", error)
        }
      }
    }
    loadAssetUrl()
  }, [record.content, record.type, supabase.storage])

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(record.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy', err)
    }
  }

  const TypeIcon = {
    text: FileText,
    code: Code2,
    image: ImageIcon,
    file: LinkIcon
  }[record.type as string] || FileText

  return (
    <div className="group break-inside-avoid relative flex flex-col gap-3 p-5 bg-zinc-900 border border-zinc-800 rounded-2xl hover:border-zinc-700 transition-colors shadow-sm overflow-hidden">
      
      {/* Header Info */}
      <div className="flex items-center justify-between opacity-60 text-xs text-zinc-400 font-mono tracking-wider uppercase">
        <div className="flex items-center gap-1.5">
          <TypeIcon className="w-3.5 h-3.5" />
          <span>{record.type}</span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          <span>{new Date(record.created_at).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="mt-2 grow overflow-hidden">
        {record.type === 'text' && (
          <div className="prose prose-invert prose-sm prose-zinc max-w-none text-zinc-300">
            <ReactMarkdown>
              {record.content}
            </ReactMarkdown>
          </div>
        )}

        {record.type === 'code' && (
          <div className="relative group/code rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950">
             <button
               onClick={copyToClipboard}
               className="absolute top-2 right-2 p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-md opacity-0 group-hover/code:opacity-100 transition-all z-10"
             >
               {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
             </button>
             <div className="p-3 overflow-x-auto text-sm">
                <ReactMarkdown
                   rehypePlugins={[rehypeHighlight]}
                >
                  {/* Wrap in markdown code block to trigger rehype */}
                  {`\`\`\`\n${record.content}\n\`\`\``}
                </ReactMarkdown>
             </div>
          </div>
        )}

        {record.type === 'image' && (
          <div className="relative rounded-xl overflow-hidden bg-zinc-950/50 border border-zinc-800/50 group/img flex items-center justify-center min-h-25">
            {imageUrl ? (
               // eslint-disable-next-line @next/next/no-img-element
               <img src={imageUrl} alt="Knowledge base asset" className="w-full h-auto object-cover max-h-100" loading="lazy" />
            ) : (
               <div className="py-8 text-zinc-600 animate-pulse text-xs text-center border border-dashed border-zinc-800/10 rounded-xl w-full">
                 加载加密图像中...
               </div>
            )}
             
            {/* View Full Screen Option (Simulated link for MVP) */}
            {imageUrl && (
              <a 
                href={imageUrl} 
                target="_blank" 
                rel="noreferrer"
                className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center"
              >
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900/90 rounded-full text-xs text-zinc-200 border border-zinc-700 font-medium tracking-wide">
                   <ExternalLink className="w-3 h-3" />
                   查看原图
                </div>
              </a>
            )}
          </div>
        )}

        {record.type === 'file' && (
           <a 
              href={imageUrl || '#'}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 p-4 rounded-xl border border-zinc-800 bg-zinc-950/50 hover:bg-zinc-800 transition-colors"
           >
              <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg shrink-0">
                 <FileText className="w-5 h-5" />
              </div>
              <div className="overflow-hidden">
                <h4 className="text-sm font-medium text-zinc-200 truncate">
                   {record.content.split('/').pop() || '加密附件'}
                </h4>
                <p className="text-xs text-zinc-500 mt-0.5">点击下载 / 预览</p>
              </div>
           </a>
        )}
      </div>

      {/* Tags Trays */}
      {record.tags && record.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5 border-t border-zinc-800/50 pt-4">
          {record.tags.map((tag: string) => (
             <span key={tag} className="px-2 py-0.5 rounded-md text-[10px] font-mono tracking-wider bg-zinc-800 text-zinc-400 border border-zinc-700/50">
               #{tag}
             </span>
          ))}
        </div>
      )}
    </div>
  )
}
