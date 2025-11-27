import { createClient } from '@/lib/supabase/server'
import CodeForm from '@/components/codes/CodeForm'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function EditCodePage({ params }: { params: Promise<{ id: string }> }) {
  // Await params (Next.js 15 requirement)
  const { id } = await params
  const supabase = await createClient()

  // Fetch the code
  const { data: code } = await supabase
    .from('codes')
    .select('*')
    .eq('id', id)
    .single()

  if (!code) {
    notFound()
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/dashboard/codes"
          className="inline-flex items-center text-sm text-neutral-400 hover:text-white mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Codes
        </Link>
        <h1 className="text-3xl font-bold text-white">Edit Code</h1>
        <p className="mt-2 text-neutral-400">
          Update code details and settings
        </p>
      </div>

      {/* Form */}
      <CodeForm code={code} />
    </div>
  )
}
