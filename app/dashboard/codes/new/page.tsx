import CodeForm from '@/components/codes/CodeForm'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function NewCodePage() {
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
        <h1 className="text-3xl font-bold text-white">Create New Code</h1>
        <p className="mt-2 text-neutral-400">
          Create a code that members can redeem to access special benefits
        </p>
      </div>

      {/* Form */}
      <CodeForm />
    </div>
  )
}
