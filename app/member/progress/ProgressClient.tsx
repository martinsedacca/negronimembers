'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Crown, Sparkles, Tag, TrendingUp, Award, Star } from 'lucide-react'

interface MembershipType {
  id: string
  name: string
  description: string
  points_required: number
  visits_required: number
  benefits: Record<string, any>
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

  return (
    <div className="min-h-screen pb-6">
      {/* Header */}
      <div className="px-6 pt-8 pb-4">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-white mb-2">Your Progress</h1>
          <p className="text-neutral-400">
            Track your membership journey
          </p>
        </motion.div>
      </div>

      {/* Current Level Card */}
      <div className="px-6 mb-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="relative overflow-hidden rounded-3xl p-8 bg-gradient-to-br from-orange-900/30 to-orange-800/30 border-2 border-orange-500/50"
        >
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{ 
              backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
              backgroundSize: '20px 20px' 
            }} />
          </div>

          <div className="relative">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl bg-orange-500/30 border-3 border-orange-500">
                {currentLevel?.name === 'Gold' ? '👑' : '🎯'}
              </div>
              <div>
                <p className="text-sm text-neutral-400 mb-1">Current Level</p>
                <h2 className="text-3xl font-bold text-white">{currentLevel?.name || member.membership_type}</h2>
              </div>
            </div>

            <p className="text-neutral-300 text-lg mb-6">
              {currentLevel?.description || 'Enjoy exclusive member benefits'}
            </p>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-neutral-900/50 rounded-xl p-3 border border-neutral-700">
                <Award className="w-5 h-5 text-orange-500 mb-1" />
                <p className="text-2xl font-bold text-white">{member.points || 0}</p>
                <p className="text-xs text-neutral-400">Points</p>
              </div>
              <div className="bg-neutral-900/50 rounded-xl p-3 border border-neutral-700">
                <TrendingUp className="w-5 h-5 text-green-500 mb-1" />
                <p className="text-2xl font-bold text-white">{transactionCount}</p>
                <p className="text-xs text-neutral-400">Visits</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Progress to Next Level */}
      {nextLevel && (
        <div className="px-6 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-gradient-to-br from-yellow-900/20 to-yellow-800/20 border-2 border-yellow-500/30 rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-yellow-500/20 border border-yellow-500 flex items-center justify-center">
                <Crown className="w-6 h-6 text-yellow-500" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-white">Next Level: {nextLevel.name}</h4>
                <p className="text-sm text-neutral-400">Complete one of the requirements below</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Points Progress */}
              {nextLevel.points_required > 0 && (
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-neutral-400 flex items-center gap-1">
                      <Award className="w-4 h-4" /> Points
                    </span>
                    <span className="text-yellow-500 font-medium">
                      {member.points || 0} / {nextLevel.points_required}
                      {pointsToNext > 0 && <span className="text-neutral-500 ml-1">({pointsToNext} to go)</span>}
                    </span>
                  </div>
                  <div className="h-3 bg-neutral-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pointsProgress}%` }}
                      transition={{ duration: 1, delay: 0.3 }}
                      className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400 rounded-full"
                    />
                  </div>
                </div>
              )}

              {/* Visits Progress */}
              {nextLevel.visits_required > 0 && (
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-neutral-400 flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" /> Visits
                    </span>
                    <span className="text-yellow-500 font-medium">
                      {transactionCount} / {nextLevel.visits_required}
                      {visitsToNext > 0 && <span className="text-neutral-500 ml-1">({visitsToNext} to go)</span>}
                    </span>
                  </div>
                  <div className="h-3 bg-neutral-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${visitsProgress}%` }}
                      transition={{ duration: 1, delay: 0.4 }}
                      className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full"
                    />
                  </div>
                </div>
              )}

              {/* OR indicator if both requirements exist */}
              {nextLevel.points_required > 0 && nextLevel.visits_required > 0 && (
                <p className="text-xs text-center text-neutral-500 py-1">
                  Complete either requirement to level up
                </p>
              )}
            </div>

            <p className="text-sm text-neutral-300 mt-4">
              {nextLevel.description}
            </p>
          </motion.div>
        </div>
      )}

      {/* Max Level Reached */}
      {isTopLevel && (
        <div className="px-6 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-gradient-to-br from-green-900/20 to-green-800/20 border-2 border-green-500/30 rounded-2xl p-6 text-center"
          >
            <Star className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <h4 className="font-bold text-white text-lg mb-2">You've reached the top!</h4>
            <p className="text-sm text-neutral-400">Enjoy all the exclusive benefits of your membership.</p>
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
  )
}
