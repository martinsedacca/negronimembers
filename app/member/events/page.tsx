'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, ChevronLeft, Check, Calendar, Users, MapPin, PartyPopper, User, Mail, Loader2, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import { useMember } from '../context/MemberContext'

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

export default function EventsPage() {
  const { member } = useMember()
  const [currentStep, setCurrentStep] = useState(0)
  const [branches, setBranches] = useState<Branch[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [fieldError, setFieldError] = useState('')
  const [initialized, setInitialized] = useState(false)
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    guests: '',
    eventDate: '',
    eventType: '',
    location: ''
  })

  // Pre-fill form with member data
  useEffect(() => {
    if (member && !initialized) {
      setFormData(prev => ({
        ...prev,
        fullName: member.full_name || '',
        email: member.email || ''
      }))
      setInitialized(true)
    }
  }, [member, initialized])

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

  // Build steps dynamically based on what data we already have
  const steps = useMemo(() => {
    const allSteps = [
      {
        id: 'name',
        title: "What's your name?",
        subtitle: "Let's start with introductions",
        icon: User,
        field: 'fullName',
        type: 'text',
        placeholder: 'Full Name',
        skip: !!member?.full_name
      },
      {
        id: 'email',
        title: "What's your email?",
        subtitle: "We'll send the confirmation here",
        icon: Mail,
        field: 'email',
        type: 'email',
        placeholder: 'your@email.com',
        skip: !!member?.email
      },
      {
        id: 'guests',
        title: 'How many guests?',
        subtitle: "Enter the exact number of people attending",
        icon: Users,
        field: 'guests',
        type: 'number',
        placeholder: 'Number of guests',
        skip: false
      },
      {
        id: 'date',
        title: 'When is your event?',
        subtitle: "Pick your preferred date",
        icon: Calendar,
        field: 'eventDate',
        type: 'date',
        skip: false
      },
      {
        id: 'eventType',
        title: 'What type of event?',
        subtitle: "Help us prepare the perfect experience",
        icon: PartyPopper,
        field: 'eventType',
        type: 'select',
        options: eventTypes,
        skip: false
      },
      {
        id: 'location',
        title: 'Select a location',
        subtitle: "Choose your preferred Negroni restaurant",
        icon: MapPin,
        field: 'location',
        type: 'location',
        skip: false
      }
    ]
    
    // Filter out steps we can skip
    return allSteps.filter(step => !step.skip)
  }, [member])

  const currentStepData = steps[currentStep]
  const isLastStep = currentStep === steps.length - 1
  
  // Validation functions
  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
  }

  const validateName = (name: string) => {
    return name.trim().length >= 2
  }

  const validateGuests = (guests: string) => {
    const num = parseInt(guests)
    return !isNaN(num) && num >= 1 && num <= 500
  }

  const validateCurrentStep = (): string | null => {
    const value = formData[currentStepData.field as keyof typeof formData]?.trim()
    
    if (!value) {
      return 'This field is required'
    }

    switch (currentStepData.id) {
      case 'name':
        if (!validateName(value)) return 'Please enter your full name'
        break
      case 'email':
        if (!validateEmail(value)) return 'Please enter a valid email address'
        break
      case 'guests':
        if (!validateGuests(value)) return 'Please enter a valid number of guests (1-500)'
        break
    }
    return null
  }

  const canProceed = formData[currentStepData.field as keyof typeof formData]?.trim() !== ''

  const handleNext = () => {
    const validationError = validateCurrentStep()
    if (validationError) {
      setFieldError(validationError)
      return
    }
    setFieldError('')
    if (!isLastStep) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handlePrev = () => {
    setFieldError('')
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && canProceed) {
      handleNext()
    }
  }

  const handleSubmit = async () => {
    const validationError = validateCurrentStep()
    if (validationError) {
      setFieldError(validationError)
      return
    }
    
    setSubmitting(true)
    setError('')
    setFieldError('')
    
    try {
      const supabase = createClient()
      
      // Get location name
      const selectedBranch = branches.find(b => b.id === formData.location)
      
      const eventData = {
        full_name: formData.fullName || member?.full_name || '',
        phone: member?.phone || '',
        email: formData.email || member?.email || '',
        guests: formData.guests,
        event_date: formData.eventDate,
        event_type: formData.eventType,
        location_id: formData.location,
        location_name: selectedBranch?.name || ''
      }
      
      const { error: insertError } = await supabase
        .from('event_requests')
        .insert({
          full_name: eventData.full_name,
          phone: eventData.phone,
          email: eventData.email,
          guests: eventData.guests,
          event_date: eventData.event_date,
          event_type: eventData.event_type,
          location_id: eventData.location_id
        })
      
      if (insertError) throw insertError
      
      // Send webhook notification
      try {
        await fetch('https://n8n.srv981992.hstgr.cloud/webhook/36dfe944-631b-46a5-89e2-6cd6f2ced1b6', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            full_name: eventData.full_name,
            email: eventData.email,
            phone: eventData.phone,
            guests: eventData.guests,
            location: eventData.location_name,
            event_type: eventData.event_type,
            event_date: eventData.event_date
          })
        })
      } catch (webhookError) {
        // Don't fail the submission if webhook fails
        console.error('Webhook error:', webhookError)
      }
      
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
    <div className="min-h-screen bg-neutral-950">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-neutral-800 z-50">
        <motion.div
          className="h-full bg-orange-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Main Content */}
      <div className="px-6 pt-8 pb-32 max-w-md mx-auto">
        {/* Logo */}
        <div className="text-center mb-6">
          <Image
            src="/NEGRONI-Logo-hueso_png.png"
            alt="Negroni"
            width={100}
            height={25}
            className="mx-auto"
          />
        </div>

        {/* Header - Only on first step */}
        <AnimatePresence mode="wait">
          {currentStep === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, height: 0 }}
              className="text-center mb-6"
            >
              <h1 className="text-2xl font-bold text-white mb-3">
                Plan Your Event
              </h1>
              <p className="text-neutral-500 text-sm leading-relaxed">
                At Negroni, we make every gathering unforgettable. Whether you&apos;re planning an intimate dinner, a birthday celebration, or a corporate meeting.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {/* "Let us help" message - Only on first step */}
            {currentStep === 0 && (
              <p className="text-orange-500 text-center text-sm font-medium mb-2">
                Let us help you plan your next celebration
              </p>
            )}

            {/* Step Icon & Title */}
            <div className="text-center mb-2">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2 ${
                currentStep === 0 ? 'bg-orange-500/20' : 'bg-neutral-800'
              }`}>
                <currentStepData.icon className={`w-5 h-5 ${
                  currentStep === 0 ? 'text-orange-500' : 'text-neutral-400'
                }`} />
              </div>
              <h2 className="text-lg font-semibold text-white">{currentStepData.title}</h2>
              <p className="text-neutral-500 text-sm">{currentStepData.subtitle}</p>
            </div>

            {/* Input Field */}
            <div>
              {currentStepData.type === 'text' ? (
                <input
                  type="text"
                  value={formData[currentStepData.field as keyof typeof formData]}
                  onChange={(e) => {
                    setFieldError('')
                    setFormData(prev => ({ ...prev, [currentStepData.field]: e.target.value }))
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder={currentStepData.placeholder}
                  className={`w-full px-6 py-4 bg-neutral-900 border-2 rounded-2xl text-white placeholder-neutral-500 focus:outline-none transition text-lg ${
                    fieldError ? 'border-red-500' : 'border-neutral-700 focus:border-orange-500'
                  }`}
                  autoFocus
                />
              ) : currentStepData.type === 'number' ? (
                <input
                  type="number"
                  inputMode="numeric"
                  min="1"
                  max="500"
                  value={formData.guests}
                  onChange={(e) => {
                    setFieldError('')
                    setFormData(prev => ({ ...prev, guests: e.target.value }))
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="e.g. 25"
                  className={`w-full px-6 py-4 bg-neutral-900 border-2 rounded-2xl text-white placeholder-neutral-500 focus:outline-none transition text-lg text-center ${
                    fieldError ? 'border-red-500' : 'border-neutral-700 focus:border-orange-500'
                  }`}
                  autoFocus
                />
              ) : currentStepData.type === 'email' ? (
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFieldError('')
                    setFormData(prev => ({ ...prev, email: e.target.value }))
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="your@email.com"
                  className={`w-full px-6 py-4 bg-neutral-900 border-2 rounded-2xl text-white placeholder-neutral-500 focus:outline-none transition text-lg ${
                    fieldError ? 'border-red-500' : 'border-neutral-700 focus:border-orange-500'
                  }`}
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

            {/* Field Error */}
            {fieldError && (
              <div className="flex items-center gap-2 text-red-500 text-sm justify-center">
                <AlertCircle className="w-4 h-4" />
                {fieldError}
              </div>
            )}

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
  )
}
