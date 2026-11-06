import { MemoryGallery } from '../components/MemoryGallery'
import { useContent } from '../lib/content'
export default function Memories() {
  const { content } = useContent()
  return <main className="mx-auto max-w-3xl space-y-4 px-4 py-6"><h1 className="text-center font-script text-4xl">{content.labels.memories}</h1><MemoryGallery /></main>
}
