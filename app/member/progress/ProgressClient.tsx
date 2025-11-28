'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Crown, Sparkles, Tag, TrendingUp, Award, Star } from 'lucide-react'
import Image from 'next/image'

interface MembershipType {
  id: string
  name: string
  description: string
  points_required: number
  visits_required: number
}

interface ProgressClientProps {
  member: any
  transactionCount: number
  memberCodes: any[]
  membershipTypes: MembershipType[]
}

export default function ProgressClient({ member, transactionCount, memberCodes, membershipTypes }: ProgressClientProps) {
  // Find current level and next level
  const { currentLevel, nextLevel, pointsProgress, visitsProgress, pointsToNext, visitsToNext } = useMemo(() => {
    // Sort by requirements (base level first, then by max of points/visits needed)
    const sortedTypes = [...membershipTypes].sort((a, b) => {
      const aReq = Math.max(a.points_required || 0, a.visits_required || 0)
      const bReq = Math.max(b.points_required || 0, b.visits_required || 0)
      return aReq - bReq
    })
    const currentPoints = member.points || 0
    const currentVisits = transactionCount
    
    // Find current level - member qualifies if they meet EITHER points OR visits requirement
    let current = sortedTypes[0]
    let next: MembershipType | null = null
    
    for (let i = 0; i < sortedTypes.length; i++) {
      const type = sortedTypes[i]
      const meetsPoints = type.points_required === 0 || currentPoints >= type.points_required
      const meetsVisits = type.visits_required === 0 || currentVisits >= type.visits_required
      
      // Qualify if meets at least one non-zero requirement, or if both are 0 (base level)
      const qualifies = (type.points_required === 0 && type.visits_required === 0) || 
                       (type.points_required > 0 && meetsPoints) || 
                       (type.visits_required > 0 && meetsVisits)
      
      if (qualifies) {
        current = type
        next = sortedTypes[i + 1] || null
      }
    }
    
    // Calculate progress to next level for both metrics
    let ptsProgress = 100
    let vtsProgress = 100
    let ptsToNext = 0
    let vtsToNext = 0
    
    if (next) {
      // Points progress
      if (next.points_required > 0) {
        const pointsInLevel = currentPoints - (current?.points_required || 0)
        const pointsNeeded = next.points_required - (current?.points_required || 0)
        ptsProgress = pointsNeeded > 0 ? Math.min(100, Math.round((pointsInLevel / pointsNeeded) * 100)) : 100
        ptsToNext = Math.max(0, next.points_required - currentPoints)
      }
      
      // Visits progress
      if (next.visits_required > 0) {
        const visitsInLevel = currentVisits - (current?.visits_required || 0)
        const visitsNeeded = next.visits_required - (current?.visits_required || 0)
        vtsProgress = visitsNeeded > 0 ? Math.min(100, Math.round((visitsInLevel / visitsNeeded) * 100)) : 100
        vtsToNext = Math.max(0, next.visits_required - currentVisits)
      }
    }
    
    return {
      currentLevel: current,
      nextLevel: next,
      pointsProgress: ptsProgress,
      visitsProgress: vtsProgress,
      pointsToNext: ptsToNext,
      visitsToNext: vtsToNext
    }
  }, [member.points, transactionCount, membershipTypes])

  const isTopLevel = !nextLevel

  // Calculate best progress (use visits if available, otherwise points)
  const mainProgress = nextLevel?.visits_required ? visitsProgress : pointsProgress
  const mainToNext = nextLevel?.visits_required ? visitsToNext : pointsToNext
  const mainMetric = nextLevel?.visits_required ? 'visits' : 'points'

  // SVG circle properties
  const circleSize = 200
  const strokeWidth = 12
  const radius = (circleSize - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progressOffset = circumference - (mainProgress / 100) * circumference

  return (
    <div className="min-h-screen pb-6 relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image 
          src="/images/brand/bar-golden.jpg" 
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
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-2xl font-bold text-white">Your Progress</h1>
            <p className="text-neutral-400 text-sm">Track your membership journey</p>
          </motion.div>
        </div>

        {/* Progress Circle */}
        <div className="px-6 mb-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="relative rounded-3xl p-8 bg-gradient-to-br from-neutral-800 to-neutral-900 border border-neutral-700 shadow-2xl"
        >
          {/* Circle */}
          <div className="flex flex-col items-center">
            <div className="relative mb-6">
              {/* Star on top */}
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-10">
                <Star className="w-6 h-6 text-orange-500 fill-orange-500" />
              </div>
              
              <svg width={circleSize} height={circleSize} className="transform -rotate-90">
                {/* Background circle */}
                <circle
                  cx={circleSize / 2}
                  cy={circleSize / 2}
                  r={radius}
                  stroke="rgb(64, 64, 64)"
                  strokeWidth={strokeWidth}
                  fill="none"
                />
                {/* Progress circle */}
                <motion.circle
                  cx={circleSize / 2}
                  cy={circleSize / 2}
                  r={radius}
                  stroke="url(#progressGradient)"
                  strokeWidth={strokeWidth}
                  fill="none"
                  strokeLinecap="round"
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset: isTopLevel ? 0 : progressOffset }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  style={{
                    strokeDasharray: circumference,
                  }}
                />
                {/* Gradient definition */}
                <defs>
                  <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#f97316" />
                    <stop offset="100%" stopColor="#eab308" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Center content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xs text-neutral-400 uppercase tracking-wider mb-1">Level</span>
                <span className="text-5xl font-bold text-white">
                  {currentLevel?.name === 'Gold' ? '👑' : currentLevel?.name?.charAt(0) || 'M'}
                </span>
                <span className="text-lg font-semibold text-orange-500 mt-1">
                  {currentLevel?.name || member.membership_type}
                </span>
              </div>
            </div>

            {/* Progress message */}
            {nextLevel ? (
              <div className="text-center">
                <p className="text-2xl font-bold text-white mb-1">
                  {mainToNext} {mainMetric} more
                </p>
                <p className="text-neutral-400">
                  to reach <span className="text-orange-500 font-semibold">{nextLevel.name}</span>
                </p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-xl font-bold text-green-500 mb-1">
                  🎉 You've reached the top!
                </p>
                <p className="text-neutral-400">
                  Enjoy all exclusive benefits
                </p>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mt-6">
            <div className="bg-neutral-900/80 rounded-xl p-4 border border-neutral-700 text-center">
              <Award className="w-5 h-5 text-orange-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{member.points || 0}</p>
              <p className="text-xs text-neutral-400">Points</p>
            </div>
            <div className="bg-neutral-900/80 rounded-xl p-4 border border-neutral-700 text-center">
              <TrendingUp className="w-5 h-5 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{transactionCount}</p>
              <p className="text-xs text-neutral-400">Visits</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Progress Bars (detailed) */}
      {nextLevel && (
        <div className="px-6 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-neutral-800 border border-neutral-700 rounded-2xl p-5"
          >
            <h4 className="font-semibold text-white mb-4">Progress to {nextLevel.name}</h4>
            
            <div className="space-y-4">
              {/* Points Progress */}
              {nextLevel.points_required > 0 && (
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-neutral-400 flex items-center gap-2">
                      <Award className="w-4 h-4 text-orange-500" /> Points
                    </span>
                    <span className="text-white font-medium">
                      {member.points || 0} / {nextLevel.points_required}
                    </span>
                  </div>
                  <div className="h-2 bg-neutral-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pointsProgress}%` }}
                      transition={{ duration: 1, delay: 0.3 }}
                      className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full"
                    />
                  </div>
                </div>
              )}

              {/* Visits Progress */}
              {nextLevel.visits_required > 0 && (
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-neutral-400 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-green-500" /> Visits
                    </span>
                    <span className="text-white font-medium">
                      {transactionCount} / {nextLevel.visits_required}
                    </span>
                  </div>
                  <div className="h-2 bg-neutral-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${visitsProgress}%` }}
                      transition={{ duration: 1, delay: 0.4 }}
                      className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full"
                    />
                  </div>
                </div>
              )}

              {nextLevel.points_required > 0 && nextLevel.visits_required > 0 && (
                <p className="text-xs text-center text-neutral-500 pt-2">
                  Complete either requirement to level up
                </p>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Codes Section */}
      {memberCodes.length > 0 && (
        <div className="px-6 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Tag className="w-5 h-5 text-purple-500" />
              <h3 className="font-bold text-white text-lg">Your Codes</h3>
              <span className="text-sm text-neutral-400">({memberCodes.length})</span>
            </div>

            <div className="space-y-2">
              {memberCodes.map((mc: any, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-r from-purple-900/20 to-purple-800/20 border border-purple-500/30 rounded-xl p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/20 border border-purple-500 flex items-center justify-center">
                      <Tag className="w-5 h-5 text-purple-500" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-white font-mono">{mc.codes.code}</p>
                      <p className="text-xs text-neutral-400">{mc.codes.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {/* Benefits Summary */}
      <div className="px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-neutral-800 border border-neutral-700 rounded-2xl p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-orange-500" />
            <h3 className="font-bold text-white">Membership Info</h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-neutral-700">
              <span className="text-sm text-neutral-400">Member Since</span>
              <span className="text-sm text-white font-medium">
                {new Date(member.joined_date).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-neutral-700">
              <span className="text-sm text-neutral-400">Expires On</span>
              <span className="text-sm text-white font-medium">
                {new Date(member.expiry_date).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-neutral-700">
              <span className="text-sm text-neutral-400">Total Points</span>
              <span className="text-sm text-white font-medium">{member.points}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-neutral-400">Total Visits</span>
              <span className="text-sm text-white font-medium">{transactionCount}</span>
            </div>
          </div>
        </motion.div>
      </div>

      </div>
    </div>
  )
}
