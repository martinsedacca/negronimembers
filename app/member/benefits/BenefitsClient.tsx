'use client'

import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Tag, Gift, Percent, Star, HelpCircle, X, ChevronLeft, ChevronRight, Lock, MapPin, Ban, Calendar, Clock } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function formatValidDays(days: number[]): string {
  if (!days || days.length === 0) return ''
  const names = days.map(d => dayNames[d])
  if (names.length === 1) return `Available ${names[0]}`
  if (names.length === 2) return `Available ${names[0]} & ${names[1]}`
  return `Available ${names.slice(0, -1).join(', ')} & ${names[names.length - 1]}`
}

interface MembershipType {
  id: string
  name: string
  description: string
  points_required: number
  visits_required: number
}

// Note: member.membership_type_id is now the source of truth for tier level
// member.membership_type (text) is kept for backwards compatibility only

interface Branch {
  id: string
  name: string
}

interface BenefitsClientProps {
  member: any
  benefits: any[]
  hasCodes: boolean
  membershipTypes: MembershipType[]
  transactionCount: number
  branches: Branch[]
}

export default function BenefitsClient({ member, benefits, hasCodes, membershipTypes, transactionCount, branches }: BenefitsClientProps) {
  const [activeTab, setActiveTab] = useState(0)
  const [showTutorial, setShowTutorial] = useState(false)
  const [tutorialStep, setTutorialStep] = useState(0)
  const [promotionUsage, setPromotionUsage] = useState<Record<string, number>>({})
  const [totalUsage, setTotalUsage] = useState<Record<string, number>>({})
  const supabase = createClient()

  // Fetch promotion usage counts
  useEffect(() => {
    async function fetchUsage() {
      // Get member's usage of each promotion
      const { data: memberUsage } = await supabase
        .from('applied_promotions')
        .select('promotion_id')
        .eq('member_id', member.id)

      // Get total usage of each promotion (for sold_out check)
      const { data: allUsage } = await supabase
        .from('applied_promotions')
        .select('promotion_id')

      // Count member usage
      const memberCounts: Record<string, number> = {}
      for (const ap of memberUsage || []) {
        if (ap.promotion_id) {
          memberCounts[ap.promotion_id] = (memberCounts[ap.promotion_id] || 0) + 1
        }
      }
      setPromotionUsage(memberCounts)

      // Count total usage
      const totalCounts: Record<string, number> = {}
      for (const ap of allUsage || []) {
        if (ap.promotion_id) {
          totalCounts[ap.promotion_id] = (totalCounts[ap.promotion_id] || 0) + 1
        }
      }
      setTotalUsage(totalCounts)
    }
    if (member?.id) {
      fetchUsage()
    }
  }, [member?.id, supabase])

  // Calculate benefit availability status
  const getBenefitStatus = (benefit: any): { isBlocked: boolean; blockReason: string | null } => {
    const currentDay = new Date().getDay()
    const memberUsed = promotionUsage[benefit.id] || 0
    const totalUsed = totalUsage[benefit.id] || 0

    // Check total usage limit (sold out)
    if (benefit.max_usage_count && totalUsed >= benefit.max_usage_count) {
      return { isBlocked: true, blockReason: 'sold_out' }
    }

    // Check per-member limit
    if (benefit.max_uses_per_member && memberUsed >= benefit.max_uses_per_member) {
      return { isBlocked: true, blockReason: 'already_used' }
    }

    // Check valid days
    if (benefit.valid_days && benefit.valid_days.length > 0 && !benefit.valid_days.includes(currentDay)) {
      return { isBlocked: true, blockReason: 'not_today' }
    }

    return { isBlocked: false, blockReason: null }
  }

  // Sort membership types by requirements
  const sortedTypes = useMemo(() => {
    return [...membershipTypes].sort((a, b) => {
      const aReq = Math.max(a.points_required || 0, a.visits_required || 0)
      const bReq = Math.max(b.points_required || 0, b.visits_required || 0)
      return aReq - bReq
    })
  }, [membershipTypes])

  // Find current member level index and calculate progress
  const { currentLevelIndex, nextLevel, progress, visitsToNext, pointsToNext, currentLevelName } = useMemo(() => {
    // Find current level by ID first, then by name as fallback
    let idx = member.membership_type_id 
      ? sortedTypes.findIndex(t => t.id === member.membership_type_id)
      : sortedTypes.findIndex(t => t.name === member.membership_type)
    
    // If not found, find by points threshold
    if (idx < 0) {
      const currentPoints = member.points || 0
      idx = 0
      for (let i = sortedTypes.length - 1; i >= 0; i--) {
        if (currentPoints >= (sortedTypes[i].points_required || 0)) {
          idx = i
          break
        }
      }
    }
    
    const currentIdx = idx
    const next = sortedTypes[currentIdx + 1] || null
    const current = sortedTypes[currentIdx]
    
    let prog = 100
    let visitsRemaining = 0
    let pointsRemaining = 0
    
    if (next) {
      const currentVisits = transactionCount
      const currentPoints = member.points || 0
      
      // Get base requirements (current level threshold)
      const baseVisits = current?.visits_required || 0
      const basePoints = current?.points_required || 0
      
      // Calculate remaining to reach next level
      visitsRemaining = next.visits_required > 0 ? Math.max(0, next.visits_required - currentVisits) : 0
      pointsRemaining = next.points_required > 0 ? Math.max(0, next.points_required - currentPoints) : 0
      
      // Calculate progress as percentage of range between current and next level
      let visitsProgress = 0
      let pointsProgress = 0
      
      if (next.visits_required > 0 && next.visits_required > baseVisits) {
        const range = next.visits_required - baseVisits
        const achieved = Math.max(0, currentVisits - baseVisits)
        visitsProgress = Math.min(100, Math.round((achieved / range) * 100))
      }
      
      if (next.points_required > 0 && next.points_required > basePoints) {
        const range = next.points_required - basePoints
        const achieved = Math.max(0, currentPoints - basePoints)
        pointsProgress = Math.min(100, Math.round((achieved / range) * 100))
      }
      
      // Use the better progress (whichever is higher)
      prog = Math.max(visitsProgress, pointsProgress)
    }
    
    return { 
      currentLevelIndex: currentIdx, 
      nextLevel: next, 
      progress: prog, 
      visitsToNext: visitsRemaining,
      pointsToNext: pointsRemaining,
      currentLevelName: current?.name || member.membership_type || 'Member'
    }
  }, [sortedTypes, member.membership_type_id, member.membership_type, member.points, transactionCount])

  // SVG circle properties
  const circleSize = 120
  const strokeWidth = 8
  const radius = (circleSize - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progressOffset = circumference - (progress / 100) * circumference

  // Get location names for a benefit
  const getLocationText = (applicableBranches: string[] | null): string => {
    if (!applicableBranches || applicableBranches.length === 0) {
      return 'All locations'
    }
    const names = applicableBranches
      .map(id => branches.find(b => b.id === id)?.name)
      .filter(Boolean)
    if (names.length === 0) return 'All locations'
    if (names.length === 1) return `Only at ${names[0]}`
    if (names.length === branches.length) return 'All locations'
    return names.join(', ')
  }

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
  const getBenefitsForLevel = (levelName: string, levelId?: string) => {
    return benefits.filter(benefit => {
      const applicable_to = benefit.applicable_to || ['all']
      // Show if applies to all OR applies to this specific tier (support both tier: and tier_id: formats)
      return applicable_to.includes('all') || 
             applicable_to.includes(`tier:${levelName}`) ||
             (levelId && applicable_to.includes(`tier_id:${levelId}`))
    })
  }

  // Separate benefits into today's and other days
  const separateBenefitsByAvailability = (levelBenefits: any[]) => {
    const currentDay = new Date().getDay()
    const todaysBenefits: any[] = []
    const otherDaysBenefits: any[] = []

    for (const benefit of levelBenefits) {
      const { isBlocked, blockReason } = getBenefitStatus(benefit)
      
      // If blocked due to day restrictions, put in "other days"
      if (blockReason === 'not_today') {
        otherDaysBenefits.push(benefit)
      } else {
        todaysBenefits.push(benefit)
      }
    }

    return { todaysBenefits, otherDaysBenefits }
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
        {/* Header with Progress Circle */}
        <div className="px-6 pt-6 pb-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center text-center"
          >
            {/* Title */}
            <p className="text-neutral-500 text-xs uppercase tracking-widest mb-3">Your Status</p>
            
            {/* Progress Circle */}
            <div className="relative mb-4">
              <svg width={circleSize} height={circleSize} className="transform -rotate-90">
                <circle
                  cx={circleSize / 2}
                  cy={circleSize / 2}
                  r={radius}
                  stroke="rgb(64, 64, 64)"
                  strokeWidth={strokeWidth}
                  fill="none"
                />
                <motion.circle
                  cx={circleSize / 2}
                  cy={circleSize / 2}
                  r={radius}
                  stroke="#E85A23"
                  strokeWidth={strokeWidth}
                  fill="none"
                  strokeLinecap="round"
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset: !nextLevel ? 0 : progressOffset }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  style={{ strokeDasharray: circumference }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-white">{currentLevelName}</span>
                <span className="text-xs text-neutral-400">{member.points} pts</span>
              </div>
            </div>
            
            {/* Progress text */}
            {nextLevel ? (
              <div className="text-center">
                <p className="text-neutral-400 text-sm mb-1">
                  {nextLevel.visits_required > 0 && nextLevel.points_required > 0 ? (
                    // Both requirements exist - show both remaining
                    <>
                      <span className="text-orange-500 font-semibold">{pointsToNext}</span> points or{' '}
                      <span className="text-orange-500 font-semibold">{visitsToNext}</span> visits
                    </>
                  ) : nextLevel.visits_required > 0 ? (
                    <><span className="text-orange-500 font-semibold">{visitsToNext}</span> visits</>
                  ) : (
                    <><span className="text-orange-500 font-semibold">{pointsToNext}</span> points</>
                  )}
                </p>
                <p className="text-neutral-500 text-xs">to reach <span className="text-white">{nextLevel.name}</span></p>
              </div>
            ) : (
              <p className="text-orange-500 text-sm font-medium">Top level reached! 🎉</p>
            )}
            
            {/* Help button */}
            <button
              onClick={() => setShowTutorial(true)}
              className="mt-3 flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-300 transition"
            >
              <HelpCircle className="w-4 h-4" />
              How it works
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
          {sortedTypes[activeTab] && (() => {
            const levelBenefits = getBenefitsForLevel(sortedTypes[activeTab].name, sortedTypes[activeTab].id)
            const isLevelLocked = activeTab > currentLevelIndex
            const { todaysBenefits, otherDaysBenefits } = isLevelLocked 
              ? { todaysBenefits: levelBenefits, otherDaysBenefits: [] }
              : separateBenefitsByAvailability(levelBenefits)

            const renderBenefit = (benefit: any, index: number, isOtherDay: boolean = false) => {
              const { isBlocked, blockReason } = !isLevelLocked 
                ? getBenefitStatus(benefit) 
                : { isBlocked: false, blockReason: null }
              
              return (
                <motion.div
                  key={benefit.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * index }}
                  className={`rounded-xl p-4 border ${
                    isLevelLocked
                      ? 'bg-neutral-800/50 border-neutral-700/50 opacity-60'
                      : isOtherDay
                        ? 'bg-neutral-800/50 border-neutral-700/50'
                        : isBlocked
                          ? 'bg-neutral-800/70 border-neutral-700/50 opacity-75'
                          : 'bg-gradient-to-br from-neutral-800 to-neutral-900 border-neutral-700'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      isLevelLocked
                        ? 'bg-neutral-700 border border-neutral-600'
                        : isOtherDay
                          ? 'bg-blue-500/10 border border-blue-500/30'
                          : isBlocked
                            ? 'bg-red-500/10 border border-red-500/30'
                            : 'bg-orange-500/20 border border-orange-500/30'
                    }`}>
                      {isLevelLocked 
                        ? <Lock className="w-5 h-5 text-neutral-500" />
                        : isOtherDay
                          ? <Clock className="w-5 h-5 text-blue-400" />
                          : isBlocked
                            ? <Ban className="w-5 h-5 text-red-400" />
                            : getDiscountIcon(benefit.discount_type)
                      }
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className={`font-semibold text-sm ${isOtherDay || isBlocked ? 'text-neutral-400' : 'text-white'}`}>
                          {benefit.title}
                        </h4>
                        {benefit.discount_type && benefit.discount_value && (
                          <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                            isLevelLocked || isBlocked || isOtherDay
                              ? 'bg-neutral-700 text-neutral-400'
                              : 'bg-orange-500/20 text-orange-400'
                          }`}>
                            {getDiscountText(benefit.discount_type, benefit.discount_value)}
                          </span>
                        )}
                      </div>
                      {benefit.description && (
                        <p className="text-xs text-neutral-400 mt-1">{benefit.description}</p>
                      )}
                      {/* Block reason badge */}
                      {isBlocked && blockReason && !isOtherDay && (
                        <div className="mt-2">
                          <span className={`text-[10px] font-bold px-2 py-1 rounded inline-flex items-center gap-1 ${
                            blockReason === 'sold_out' ? 'bg-red-500/20 text-red-400' :
                            'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {blockReason === 'sold_out' && 'SOLD OUT'}
                            {blockReason === 'already_used' && 'ALREADY USED'}
                          </span>
                        </div>
                      )}
                      {/* Available days badge for other days */}
                      {isOtherDay && benefit.valid_days && (
                        <div className="mt-2">
                          <span className="text-[10px] font-medium px-2 py-1 rounded inline-flex items-center gap-1 bg-blue-500/10 text-blue-400">
                            <Calendar className="w-3 h-3" />
                            {formatValidDays(benefit.valid_days)}
                          </span>
                        </div>
                      )}
                      {/* Location info */}
                      <div className="flex items-center gap-1 mt-2 text-xs text-neutral-500">
                        <MapPin className="w-3 h-3" />
                        <span>{getLocationText(benefit.applicable_branches)}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            }

            return levelBenefits.length > 0 ? (
              <div className="space-y-6">
                {isLevelLocked ? (
                  // Locked levels: show all benefits in one section
                  <div>
                    <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                      <Lock className="w-4 h-4 text-neutral-500" />
                      {sortedTypes[activeTab]?.name} Benefits
                      <span className="text-sm text-neutral-400 font-normal">
                        ({levelBenefits.length})
                      </span>
                    </h4>
                    <div className="space-y-3">
                      {levelBenefits.map((benefit: any, index: number) => renderBenefit(benefit, index, false))}
                    </div>
                  </div>
                ) : (
                  // Current level: separate Today's and More Benefits
                  <>
                    {/* Today's Benefits */}
                    {todaysBenefits.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                          <Gift className="w-4 h-4 text-orange-500" />
                          Today's Benefits
                          <span className="text-sm text-neutral-400 font-normal">
                            ({todaysBenefits.length})
                          </span>
                        </h4>
                        <div className="space-y-3">
                          {todaysBenefits.map((benefit: any, index: number) => renderBenefit(benefit, index, false))}
                        </div>
                      </div>
                    )}

                    {/* More Benefits (other days) */}
                    {otherDaysBenefits.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-neutral-400 mb-3 flex items-center gap-2">
                          <Clock className="w-4 h-4 text-blue-400" />
                          More Benefits
                          <span className="text-sm text-neutral-500 font-normal">
                            ({otherDaysBenefits.length})
                          </span>
                        </h4>
                        <div className="space-y-3">
                          {otherDaysBenefits.map((benefit: any, index: number) => renderBenefit(benefit, index, true))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : (
              <div className="text-center py-8 bg-neutral-800/50 rounded-xl border border-neutral-700">
              <Sparkles className="w-10 h-10 text-neutral-600 mx-auto mb-2" />
              <p className="text-neutral-400 text-sm">No benefits available for this level yet</p>
            </div>
          )
          })()}
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
