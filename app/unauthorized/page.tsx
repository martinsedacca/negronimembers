// =====================================================================
// PAGE: /unauthorized
// =====================================================================

import Link from 'next/link'
import { ShieldAlert } from 'lucide-react'

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="rounded-full bg-red-500/10 p-6">
            <ShieldAlert className="w-16 h-16 text-red-500" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-white mb-4">
          Access Denied
        </h1>

        <p className="text-neutral-400 mb-8">
          You don't have permission to access this page. If you believe this is an error, 
          please contact your administrator.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/dashboard"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Go to Dashboard
          </Link>

          <Link
            href="/auth/logout"
            className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg font-medium transition-colors"
          >
            Logout
          </Link>
        </div>

        <div className="mt-8 p-4 bg-neutral-800/50 rounded-lg border border-neutral-700">
          <p className="text-sm text-neutral-400">
            <strong className="text-white">Need help?</strong><br />
            Contact support or your system administrator for assistance.
          </p>
        </div>
      </div>
    </div>
  )
}
