'use client'

import { motion } from 'framer-motion'
import { Ticket, Construction } from 'lucide-react'
import Link from 'next/link'

export default function CouponsPage() {
  return (
    <div className="min-h-screen pb-6">
      {/* Header */}
      <div className="px-6 pt-8 pb-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full mb-4">
            <Ticket className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Coupons</h1>
          <p className="text-neutral-400">
            Your available discount coupons
          </p>
        </motion.div>
      </div>

      {/* Coming Soon */}
      <div className="px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-neutral-800 border border-neutral-700 rounded-2xl p-8 text-center"
        >
          <Construction className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Coming Soon</h2>
          <p className="text-neutral-400 mb-6">
            We're working on bringing you exclusive coupons and discounts.
            Check back soon!
          </p>
          <Link
            href="/member/benefits"
            className="inline-block px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold transition"
          >
            View Benefits Instead
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
