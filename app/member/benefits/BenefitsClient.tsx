'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Crown, Tag, Gift, Percent, Star } from 'lucide-react'
import Link from 'next/link'

interface BenefitsClientProps {
  member: any
  benefits: any[]
  hasCodes: boolean
}

export default function BenefitsClient({ member, benefits, hasCodes }: BenefitsClientProps) {
  const isGold = member.membership_type === 'Gold'

  const getDiscountIcon = (type: string) => {
    switch (type) {
      case 'percentage':
        return <Percent className="w-5 h-5" />
      case 'fixed':
        return <Gift className="w-5 h-5" />
      case 'points':
        return <Star className="w-5 h-5" />
      default:
        return <Sparkles className="w-5 h-5" />
    }
  }

  const getDiscountText = (type: string, value: number) => {
    switch (type) {
      case 'percentage':
        return `${value}% OFF`
      case 'fixed':
        return `$${value} OFF`
      case 'points':
        return `${value} Points`
      default:
        return 'Benefit'
    }
  }

  return (
    <div className="min-h-screen pb-6">
      {/* Header */}
      <div className="px-6 pt-8 pb-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Your Benefits</h1>
            <p className="text-neutral-400">
              Enjoy your {member.membership_type} perks
              {hasCodes && ' + special code benefits'}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Membership Badge */}
      <div className="px-6 mb-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className={`p-6 rounded-2xl border ${
            isGold 
              ? 'bg-gradient-to-br from-yellow-900/20 to-yellow-800/20 border-yellow-500/30'
              : 'bg-gradient-to-br from-orange-900/20 to-orange-800/20 border-orange-500/30'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className={`w-16 h-16 rounded-xl flex items-center justify-center text-3xl ${
                  isGold 
                    ? 'bg-yellow-500/20 border-2 border-yellow-500'
                    : 'bg-orange-500/20 border-2 border-orange-500'
                }`}
              >
                {isGold ? '👑' : '🎯'}
              </div>
              <div>
                <p className="text-sm text-neutral-400">Your Membership</p>
                <h2 className="text-2xl font-bold text-white">{member.membership_type}</h2>
                <p className="text-xs text-neutral-500 mt-1">
                  {member.points} points
                </p>
              </div>
            </div>
            {isGold && (
              <Crown className="w-8 h-8 text-yellow-500" />
            )}
          </div>
        </motion.div>
      </div>

      {/* Benefits List */}
      <div className="px-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-orange-500" />
          <h3 className="font-bold text-white text-lg">Available Benefits</h3>
          <span className="text-sm text-neutral-400">({benefits.length})</span>
        </div>

        {benefits.length > 0 ? (
          <div className="space-y-3">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.05 }}
                className="bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-xl p-4 border border-neutral-700"
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-brand-500/20 border border-orange-500/30 flex items-center justify-center flex-shrink-0">
                    {getDiscountIcon(benefit.discount_type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="font-semibold text-white">{benefit.title}</h4>
                      <span className="text-xs px-2 py-1 rounded-full bg-orange-500/20 text-orange-400 font-semibold whitespace-nowrap">
                        {getDiscountText(benefit.discount_type, benefit.discount_value)}
                      </span>
                    </div>
                    {benefit.description && (
                      <p className="text-sm text-neutral-400 mb-2">{benefit.description}</p>
                    )}
                    <div className="flex items-center gap-2 text-xs text-neutral-500">
                      <span>Valid until {new Date(benefit.end_date).toLocaleDateString()}</span>
                      {benefit.max_usage_count && (
                        <>
                          <span>•</span>
                          <span>Limited to {benefit.max_usage_count} uses</span>
                        </>
                      )}
                    </div>
                    {benefit.terms_conditions && (
                      <p className="text-xs text-neutral-500 italic mt-2 border-t border-neutral-700 pt-2">
                        {benefit.terms_conditions}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 bg-neutral-800 border border-neutral-700 rounded-xl"
          >
            <Sparkles className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No benefits available</h3>
            <p className="text-neutral-400 text-sm mb-4">
              Check back later for new promotions!
            </p>
          </motion.div>
        )}

        {/* Redeem Code CTA */}
        {!hasCodes && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-6"
          >
            <div className="p-4 bg-purple-900/20 border border-purple-500/30 rounded-xl">
              <div className="flex items-start gap-3 mb-3">
                <Tag className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-white mb-1">Have a special code?</h4>
                  <p className="text-sm text-neutral-300">
                    Redeem it to unlock exclusive benefits
                  </p>
                </div>
              </div>
              <Link
                href="/member/codes"
                className="block w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition text-center"
              >
                Redeem Code
              </Link>
            </div>
          </motion.div>
        )}

        {/* Upgrade CTA for Member users */}
        {!isGold && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-6 p-6 bg-gradient-to-br from-yellow-900/20 to-yellow-800/20 border-2 border-yellow-500/30 rounded-2xl"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-yellow-500/20 border border-yellow-500 flex items-center justify-center flex-shrink-0">
                <Crown className="w-6 h-6 text-yellow-500" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-white mb-1">Upgrade to Gold</h4>
                <p className="text-sm text-neutral-400">
                  Unlock premium benefits and exclusive perks
                </p>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-neutral-300">
                <span className="text-green-500">✓</span>
                <span>Priority access to events</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-neutral-300">
                <span className="text-green-500">✓</span>
                <span>Exclusive Gold member benefits</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-neutral-300">
                <span className="text-green-500">✓</span>
                <span>Special birthday rewards</span>
              </div>
            </div>

            <Link
              href="/member/progress"
              className="block w-full py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black rounded-xl font-semibold hover:from-yellow-600 hover:to-yellow-700 transition text-center"
            >
              Learn More About Gold
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  )
}
