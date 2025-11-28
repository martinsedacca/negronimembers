'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, ChevronLeft, Check, Calendar, Users, MapPin, PartyPopper, User, Phone, Mail, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'

interface Branch {
  id: string
  name: string
  city: string | null
}

const eventTypes = [
  'Birthday Celebration',
  'Corporate Meeting',
  'Private Dinner',
  'Anniversary',
  'Graduation Party',
  'Bachelor/Bachelorette Party',
  'Holiday Party',
  'Other'
]

const guestRanges = [
  '1-10',
  '11-20',
  '21-30',
  '31-50',
  '51-100',
  '100+'
]

export default function EventsPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [branches, setBranches] = useState<Branch[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    guests: '',
    eventDate: '',
    eventType: '',
    location: ''
  })

  useEffect(() => {
    async function fetchBranches() {
      const supabase = createClient()
      const { data } = await supabase
        .from('branches')
        .select('id, name, city')
        .eq('is_active', true)
        .order('name')
      if (data) setBranches(data)
    }
    fetchBranches()
  }, [])

  const steps = [
    {
      id: 'name',
      title: "What's your name?",
      subtitle: "Let's start with introductions",
      icon: User,
      field: 'fullName',
      type: 'text',
      placeholder: 'Full Name'
    },
    {
      id: 'phone',
      title: "What's your phone number?",
      subtitle: "We'll use this to confirm your reservation",
      icon: Phone,
      field: 'phone',
      type: 'tel',
      placeholder: 'Phone Number'
    },
    {
      id: 'email',
      title: "What's your email?",
      subtitle: "We'll send the confirmation here",
      icon: Mail,
      field: 'email',
      type: 'email',
      placeholder: 'Email Address'
    },
    {
      id: 'guests',
      title: 'How many guests?',
      subtitle: "Select the number of people attending",
      icon: Users,
      field: 'guests',
      type: 'select',
      options: guestRanges
    },
    {
      id: 'date',
      title: 'When is your event?',
      subtitle: "Pick your preferred date",
      icon: Calendar,
      field: 'eventDate',
      type: 'date'
    },
    {
      id: 'eventType',
      title: 'What type of event?',
      subtitle: "Help us prepare the perfect experience",
      icon: PartyPopper,
      field: 'eventType',
      type: 'select',
      options: eventTypes
    },
    {
      id: 'location',
      title: 'Select a location',
      subtitle: "Choose your preferred Negroni restaurant",
      icon: MapPin,
      field: 'location',
      type: 'location'
    }
  ]

  const currentStepData = steps[currentStep]
  const isLastStep = currentStep === steps.length - 1
  const canProceed = formData[currentStepData.field as keyof typeof formData]?.trim() !== ''

  const handleNext = () => {
    if (canProceed && !isLastStep) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && canProceed && !isLastStep) {
      handleNext()
    }
  }

  const handleSubmit = async () => {
    if (!canProceed) return
    
    setSubmitting(true)
    setError('')
    
    try {
      const supabase = createClient()
      const { error: insertError } = await supabase
        .from('event_requests')
        .insert({
          full_name: formData.fullName,
          phone: formData.phone,
          email: formData.email,
          guests: formData.guests,
          event_date: formData.eventDate,
          event_type: formData.eventType,
          location_id: formData.location
        })
      
      if (insertError) throw insertError
      setSubmitted(true)
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const progress = ((currentStep + 1) / steps.length) * 100

  if (submitted) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Request Received!</h2>
          <p className="text-neutral-400 mb-8">
            Thank you for your interest in hosting your event at Negroni. Our team will contact you within 24 hours to discuss the details.
          </p>
          <a
            href="/member"
            className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition"
          >
            Back to Home
          </a>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-neutral-800 z-50">
        <motion.div
          className="h-full bg-orange-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Header - Only on first step */}
      <AnimatePresence mode="wait">
        {currentStep === 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="px-6 pt-12 pb-2 text-center"
          >
            <Image
              src="/NEGRONI-Logo-hueso_png.png"
              alt="Negroni"
              width={100}
              height={25}
              className="mx-auto mb-4"
            />
            <p className="text-orange-500 text-sm font-medium tracking-wide uppercase mb-2">
              Let us help you plan your next celebration
            </p>
            <h1 className="text-3xl font-bold text-white">
              Plan Your Event
            </h1>
            <p className="text-neutral-400 text-sm leading-relaxed mt-3 max-w-sm mx-auto">
              At Negroni, we make every gathering unforgettable. Whether you're planning an intimate dinner, a birthday celebration, or a corporate meeting, we offer the perfect setting.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-4">
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {/* Step Icon & Title */}
              <div className="text-center mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 ${
                  currentStep === 0 ? 'bg-orange-500/20' : 'bg-neutral-800'
                }`}>
                  <currentStepData.icon className={`w-5 h-5 ${
                    currentStep === 0 ? 'text-orange-500' : 'text-neutral-400'
                  }`} />
                </div>
                <h2 className="text-xl font-bold text-white">{currentStepData.title}</h2>
                <p className="text-neutral-500 text-sm mt-1">{currentStepData.subtitle}</p>
              </div>

              {/* Input Field */}
              <div>
                {currentStepData.type === 'text' || currentStepData.type === 'email' || currentStepData.type === 'tel' ? (
                  <input
                    type={currentStepData.type}
                    value={formData[currentStepData.field as keyof typeof formData]}
                    onChange={(e) => setFormData(prev => ({ ...prev, [currentStepData.field]: e.target.value }))}
                    onKeyDown={handleKeyDown}
                    placeholder={currentStepData.placeholder}
                    className="w-full px-6 py-4 bg-neutral-900 border-2 border-neutral-700 rounded-2xl text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500 transition text-lg"
                    autoFocus
                  />
                ) : currentStepData.type === 'date' ? (
                  <input
                    type="date"
                    value={formData.eventDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, eventDate: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-6 py-4 bg-neutral-900 border-2 border-neutral-700 rounded-2xl text-white focus:outline-none focus:border-orange-500 transition text-lg [color-scheme:dark]"
                  />
                ) : currentStepData.type === 'select' ? (
                  <div className="grid grid-cols-2 gap-3">
                    {currentStepData.options?.map((option) => (
                      <button
                        key={option}
                        onClick={() => setFormData(prev => ({ ...prev, [currentStepData.field]: option }))}
                        className={`px-4 py-4 rounded-xl border-2 transition text-left ${
                          formData[currentStepData.field as keyof typeof formData] === option
                            ? 'bg-orange-500/20 border-orange-500 text-orange-500'
                            : 'bg-neutral-900 border-neutral-700 text-white hover:border-neutral-600'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                ) : currentStepData.type === 'location' ? (
                  <div className="space-y-3">
                    {branches.map((branch) => (
                      <button
                        key={branch.id}
                        onClick={() => setFormData(prev => ({ ...prev, location: branch.id }))}
                        className={`w-full px-6 py-4 rounded-xl border-2 transition text-left flex items-center gap-4 ${
                          formData.location === branch.id
                            ? 'bg-orange-500/20 border-orange-500'
                            : 'bg-neutral-900 border-neutral-700 hover:border-neutral-600'
                        }`}
                      >
                        <MapPin className={`w-5 h-5 ${
                          formData.location === branch.id ? 'text-orange-500' : 'text-neutral-500'
                        }`} />
                        <div>
                          <p className={`font-semibold ${
                            formData.location === branch.id ? 'text-orange-500' : 'text-white'
                          }`}>{branch.name}</p>
                          {branch.city && (
                            <p className="text-sm text-neutral-500">{branch.city}</p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>

              {error && (
                <p className="text-red-500 text-sm text-center">{error}</p>
              )}

              {/* Navigation */}
              <div className="flex items-center gap-4 pt-6">
                {currentStep > 0 && (
                  <button
                    onClick={handlePrev}
                    className="flex-1 py-4 bg-neutral-800 border border-neutral-700 rounded-xl font-semibold text-white hover:bg-neutral-700 transition flex items-center justify-center gap-2"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    Back
                  </button>
                )}
                
                {isLastStep ? (
                  <button
                    onClick={handleSubmit}
                    disabled={!canProceed || submitting}
                    className={`flex-1 py-4 rounded-xl font-semibold transition flex items-center justify-center gap-2 ${
                      canProceed && !submitting
                        ? 'bg-orange-500 text-white hover:bg-orange-600'
                        : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                    }`}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        Plan Your Event
                        <Check className="w-5 h-5" />
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    disabled={!canProceed}
                    className={`flex-1 py-4 rounded-xl font-semibold transition flex items-center justify-center gap-2 ${
                      canProceed
                        ? 'bg-orange-500 text-white hover:bg-orange-600'
                        : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                    }`}
                  >
                    Continue
                    <ChevronRight className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Step Counter */}
              <p className="text-center text-neutral-600 text-sm">
                Step {currentStep + 1} of {steps.length}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
