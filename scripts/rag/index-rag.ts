import dotenv from 'dotenv'
import { runRagIndex } from '../../src/lib/rag/indexer'

dotenv.config({ path: '.env.local', override: true })
dotenv.config({ override: true })

async function main() {
  const stats = await runRagIndex({ log: true })
  console.log(`RAG index complete: ${stats.indexed} indexed, ${stats.skipped} skipped, ${stats.depublished} depublished, ${stats.chunks} chunks created from ${stats.documents} documents`)
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
