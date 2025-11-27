'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Tag, Gift, Percent, Star, HelpCircle, X, ChevronLeft, ChevronRight, Lock } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface MembershipType {
  id: string
  name: string
  description: string
  points_required: number
  visits_required: number
  benefits: Record<string, any>
}

interface BenefitsClientProps {
  member: any
  benefits: any[]
  hasCodes: boolean
  membershipTypes: MembershipType[]
}

export default function BenefitsClient({ member, benefits, hasCodes, membershipTypes }: BenefitsClientProps) {
  const [activeTab, setActiveTab] = useState(0)
  const [showTutorial, setShowTutorial] = useState(false)
  const [tutorialStep, setTutorialStep] = useState(0)

  // Sort membership types by requirements
  const sortedTypes = useMemo(() => {
    return [...membershipTypes].sort((a, b) => {
      const aReq = Math.max(a.points_required || 0, a.visits_required || 0)
      const bReq = Math.max(b.points_required || 0, b.visits_required || 0)
      return aReq - bReq
    })
  }, [membershipTypes])

  // Find current member level index
  const currentLevelIndex = useMemo(() => {
    const idx = sortedTypes.findIndex(t => t.name === member.membership_type)
    return idx >= 0 ? idx : 0
  }, [sortedTypes, member.membership_type])

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

  // Filter benefits (promotions) by membership level
  const getBenefitsForLevel = (levelName: string) => {
    return benefits.filter(benefit => {
      const applicable_to = benefit.applicable_to || ['all']
      // Show if applies to all OR applies to this specific tier
      return applicable_to.includes('all') || applicable_to.includes(`tier:${levelName}`)
    })
  }

  // Tutorial content
  const tutorialSteps = [
    {
      title: 'Welcome to the program!',
      description: 'Earn points with every visit and unlock exclusive benefits.',
      icon: '🎉'
    },
    {
      title: 'Level up',
      description: 'As you accumulate points or visits, you level up automatically.',
      icon: '⬆️'
    },
    {
      title: 'More benefits',
      description: 'Each level has better benefits. Reach the top level to enjoy everything!',
      icon: '🎁'
    }
  ]

  return (
    <div className="min-h-screen pb-6 relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image 
          src="/images/brand/lounge-red.jpg" 
          alt="" 
          fill
          className="object-cover opacity-40"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/30 via-neutral-950/70 to-neutral-950" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="px-6 pt-8 pb-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start justify-between"
          >
            <div>
              <h1 className="text-2xl font-bold text-white">Benefits</h1>
              <p className="text-neutral-400 text-sm">Explore benefits by level</p>
            </div>
            <button
              onClick={() => setShowTutorial(true)}
              className="flex items-center gap-2 text-sm text-orange-500 hover:text-orange-400 transition"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
          </motion.div>
        </div>

        {/* Level Tabs */}
        {sortedTypes.length > 0 && (
          <div className="px-6 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-neutral-800/80 backdrop-blur-sm rounded-xl p-1 flex"
            >
            {sortedTypes.map((type, index) => {
              const isActive = activeTab === index
              const isCurrent = index === currentLevelIndex
              const isLocked = index > currentLevelIndex
              
              return (
                <button
                  key={type.id}
                  onClick={() => setActiveTab(index)}
                  className={`flex-1 relative py-3 px-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-orange-500 text-white'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <span className="flex items-center justify-center gap-1">
                    {isLocked && <Lock className="w-3 h-3" />}
                    {type.name}
                  </span>
                  {isCurrent && !isActive && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full" />
                  )}
                </button>
              )
            })}
          </motion.div>
        </div>
      )}

      {/* Level Info */}
      {sortedTypes[activeTab] && (
        <div className="px-6 mb-6">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`p-5 rounded-2xl border ${
              activeTab === currentLevelIndex
                ? 'bg-gradient-to-br from-orange-900/30 to-orange-800/20 border-orange-500/50'
                : activeTab > currentLevelIndex
                ? 'bg-neutral-800/50 border-neutral-700'
                : 'bg-gradient-to-br from-green-900/20 to-green-800/10 border-green-500/30'
            }`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                activeTab === currentLevelIndex
                  ? 'bg-orange-500/20 border-2 border-orange-500'
                  : activeTab > currentLevelIndex
                  ? 'bg-neutral-700 border-2 border-neutral-600'
                  : 'bg-green-500/20 border-2 border-green-500'
              }`}>
                {activeTab === currentLevelIndex ? '⭐' : activeTab > currentLevelIndex ? '🔒' : '✅'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-white">{sortedTypes[activeTab].name}</h3>
                  {activeTab === currentLevelIndex && (
                    <span className="text-xs px-2 py-0.5 bg-orange-500 text-white rounded-full">Current</span>
                  )}
                  {activeTab < currentLevelIndex && (
                    <span className="text-xs px-2 py-0.5 bg-green-500 text-white rounded-full">Completed</span>
                  )}
                </div>
                <p className="text-sm text-neutral-400">{sortedTypes[activeTab].description}</p>
              </div>
            </div>

            {/* Requirements */}
            {activeTab > currentLevelIndex && (
              <div className="mt-3 p-3 bg-neutral-900/50 rounded-lg">
                <p className="text-xs text-neutral-500 mb-2">To unlock you need:</p>
                <div className="flex gap-4 text-sm">
                  {sortedTypes[activeTab].points_required > 0 && (
                    <span className="text-orange-400">
                      {sortedTypes[activeTab].points_required} points
                    </span>
                  )}
                  {sortedTypes[activeTab].points_required > 0 && sortedTypes[activeTab].visits_required > 0 && (
                    <span className="text-neutral-500">or</span>
                  )}
                  {sortedTypes[activeTab].visits_required > 0 && (
                    <span className="text-green-400">
                      {sortedTypes[activeTab].visits_required} visits
                    </span>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* Benefits for this level */}
      <div className="px-6 mb-6">
        <motion.div
          key={`benefits-${activeTab}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
            <Gift className="w-4 h-4 text-orange-500" />
            {sortedTypes[activeTab]?.name || 'Level'} Benefits
            <span className="text-sm text-neutral-400 font-normal">
              ({sortedTypes[activeTab] ? getBenefitsForLevel(sortedTypes[activeTab].name).length : 0})
            </span>
          </h4>

          {sortedTypes[activeTab] && getBenefitsForLevel(sortedTypes[activeTab].name).length > 0 ? (
            <div className="space-y-3">
              {getBenefitsForLevel(sortedTypes[activeTab].name).map((benefit: any, index: number) => (
                <motion.div
                  key={benefit.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * index }}
                  className={`rounded-xl p-4 border ${
                    activeTab <= currentLevelIndex
                      ? 'bg-gradient-to-br from-neutral-800 to-neutral-900 border-neutral-700'
                      : 'bg-neutral-800/50 border-neutral-700/50 opacity-60'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      activeTab <= currentLevelIndex
                        ? 'bg-orange-500/20 border border-orange-500/30'
                        : 'bg-neutral-700 border border-neutral-600'
                    }`}>
                      {activeTab <= currentLevelIndex 
                        ? getDiscountIcon(benefit.discount_type)
                        : <Lock className="w-5 h-5 text-neutral-500" />
                      }
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-semibold text-white text-sm">{benefit.title}</h4>
                        {benefit.discount_type && benefit.discount_value && (
                          <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                            activeTab <= currentLevelIndex
                              ? 'bg-orange-500/20 text-orange-400'
                              : 'bg-neutral-700 text-neutral-400'
                          }`}>
                            {getDiscountText(benefit.discount_type, benefit.discount_value)}
                          </span>
                        )}
                      </div>
                      {benefit.description && (
                        <p className="text-xs text-neutral-400 mt-1">{benefit.description}</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-neutral-800/50 rounded-xl border border-neutral-700">
              <Sparkles className="w-10 h-10 text-neutral-600 mx-auto mb-2" />
              <p className="text-neutral-400 text-sm">No benefits available for this level yet</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Redeem Code CTA */}
      {!hasCodes && (
        <div className="px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-4 bg-purple-900/20 border border-purple-500/30 rounded-xl"
          >
            <div className="flex items-center gap-3 mb-3">
              <Tag className="w-5 h-5 text-purple-500" />
              <div>
                <h4 className="font-semibold text-white text-sm">Have a special code?</h4>
                <p className="text-xs text-neutral-400">Redeem it to unlock exclusive benefits</p>
              </div>
            </div>
            <Link
              href="/member/codes"
              className="block w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition text-center text-sm"
            >
              Redeem Code
            </Link>
          </motion.div>
        </div>
      )}
      </div>

      {/* Tutorial Modal */}
      <AnimatePresence>
        {showTutorial && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6"
            onClick={() => setShowTutorial(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm bg-neutral-900 border border-neutral-700 rounded-2xl overflow-hidden"
            >
              {/* Close button */}
              <button
                onClick={() => setShowTutorial(false)}
                className="absolute top-4 right-4 text-neutral-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Content */}
              <div className="p-8 text-center">
                <motion.div
                  key={tutorialStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="mb-6"
                >
                  <span className="text-6xl block mb-4">{tutorialSteps[tutorialStep].icon}</span>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {tutorialSteps[tutorialStep].title}
                  </h3>
                  <p className="text-neutral-400">
                    {tutorialSteps[tutorialStep].description}
                  </p>
                </motion.div>

                {/* Dots */}
                <div className="flex justify-center gap-2 mb-6">
                  {tutorialSteps.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setTutorialStep(index)}
                      className={`w-2 h-2 rounded-full transition ${
                        index === tutorialStep ? 'bg-orange-500 w-6' : 'bg-neutral-600'
                      }`}
                    />
                  ))}
                </div>

                {/* Navigation */}
                <div className="flex gap-3">
                  {tutorialStep > 0 && (
                    <button
                      onClick={() => setTutorialStep(tutorialStep - 1)}
                      className="flex-1 py-3 bg-neutral-800 text-white rounded-xl font-semibold hover:bg-neutral-700 transition flex items-center justify-center gap-2"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Back
                    </button>
                  )}
                  {tutorialStep < tutorialSteps.length - 1 ? (
                    <button
                      onClick={() => setTutorialStep(tutorialStep + 1)}
                      className="flex-1 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition flex items-center justify-center gap-2"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowTutorial(false)}
                      className="flex-1 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition"
                    >
                      Got it!
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
