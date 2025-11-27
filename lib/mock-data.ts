// Mock data for UI development

export const mockMember = {
  id: 'mock-member-1',
  full_name: 'Sarah Martinez',
  email: 'sarah@example.com',
  phone: '+1 (305) 123-4567',
  membership_type: 'Member', // Member or Gold
  points: 145,
  member_number: '9GEEK2XUC8',
  status: 'active',
  date_of_birth: '1990-05-15',
  joined_date: '2024-01-15',
  onboarding_completed: true,
}

// Membership types (not levels - these are paid memberships, not progression)
export const mockMembershipTypes = [
  {
    id: 'member',
    name: 'Member',
    description: 'Standard membership with essential benefits',
    price: 0,
    color: '#F97316', // Orange
    icon: '🥉',
  },
  {
    id: 'gold',
    name: 'Gold',
    description: 'Premium membership with enhanced benefits',
    price: 99,
    color: '#EAB308', // Gold
    icon: '🥇',
  },
]

// Benefits for each membership type (matches DB promotions)
export const mockBenefits = {
  member: [
    {
      id: 'b1',
      title: 'Free Coffee at Lunch',
      description: 'Get a free coffee with your lunch purchase',
      icon: '☕',
      type: 'freebie',
      terms: 'Valid Monday-Friday, 11:30am-2:30pm',
    },
    {
      id: 'b2',
      title: '10% Off Takeaway',
      description: '10% discount on all takeaway orders',
      icon: '🥡',
      type: 'discount',
      terms: 'Applicable to any takeaway order',
    },
    {
      id: 'b3',
      title: 'Complimentary Drink at Brunch',
      description: 'Get 1 free drink with your brunch order',
      icon: '🍹',
      type: 'freebie',
      terms: 'Valid Saturday-Sunday, 9am-2pm',
    },
    {
      id: 'b4',
      title: 'Birthday Person Eats Free',
      description: 'Free meal + drink at tables of 6+ people',
      icon: '🎂',
      type: 'freebie',
      terms: 'Birthday month only, table must have 6+ guests',
    },
  ],
  gold: [
    {
      id: 'g1',
      title: 'All Member Benefits',
      description: 'Includes everything from Member',
      icon: '✅',
      type: 'inherited',
    },
    {
      id: 'g2',
      title: '15% Off Takeaway',
      description: 'Upgraded discount on all takeaway orders',
      icon: '🥡',
      type: 'discount',
      terms: 'Gold exclusive - replaces 10% Member benefit',
    },
    {
      id: 'g3',
      title: 'Priority Reservations',
      description: 'Skip the wait list',
      icon: '🪑',
      type: 'special',
    },
    {
      id: 'g4',
      title: 'Exclusive Events Access',
      description: 'VIP invitations to special events',
      icon: '🎉',
      type: 'special',
    },
  ],
}

export const mockHistory = [
  {
    id: 'h1',
    type: 'upgrade',
    title: 'Upgraded to Gold membership',
    date: new Date('2025-01-20T14:30:00'),
    icon: '🥇',
    color: '#EAB308',
    points_earned: 0,
    notes: 'Welcome to Gold benefits',
  },
  {
    id: 'h2',
    type: 'visit',
    title: 'Visit registered',
    date: new Date('2025-01-20T14:30:00'),
    icon: '🗺️',
    color: '#60A5FA',
    points_earned: 10,
    notes: 'Wynwood location',
  },
  {
    id: 'h3',
    type: 'purchase',
    title: 'Purchase completed',
    date: new Date('2025-01-18T16:45:00'),
    icon: '🛒',
    color: '#34D399',
    points_earned: 25,
    amount: 24.50,
    notes: 'Coffee + Croissants',
  },
  {
    id: 'h4',
    type: 'promotion',
    title: 'Promotion redeemed',
    date: new Date('2025-01-15T12:15:00'),
    icon: '🎁',
    color: '#A78BFA',
    points_earned: 0,
    notes: 'Free coffee',
  },
  {
    id: 'h5',
    type: 'visit',
    title: 'Visit registered',
    date: new Date('2025-01-12T19:00:00'),
    icon: '🗺️',
    color: '#60A5FA',
    points_earned: 10,
    notes: 'Brickell location',
  },
  {
    id: 'h6',
    type: 'purchase',
    title: 'Purchase completed',
    date: new Date('2025-01-10T11:30:00'),
    icon: '🛒',
    color: '#34D399',
    points_earned: 18,
    amount: 18.00,
    notes: 'Smoothie + Toast',
  },
]

export const mockOnboardingQuestions = [
  {
    id: 'q1',
    question_text: 'What\'s your favorite drink?',
    question_type: 'select',
    options: ['Coffee', 'Tea', 'Smoothie', 'Fresh Juice'],
    is_required: true,
    display_order: 1,
  },
  {
    id: 'q2',
    question_text: 'What do you like to do at Negroni?',
    question_type: 'multi_select',
    options: ['Work', 'Study', 'Meetings', 'Relax'],
    is_required: true,
    display_order: 2,
  },
  {
    id: 'q3',
    question_text: 'Do you have any dietary restrictions?',
    question_type: 'yes_no',
    options: null,
    is_required: false,
    display_order: 3,
  },
  {
    id: 'q4',
    question_text: 'How would you rate your first experience?',
    question_type: 'rating',
    options: null,
    is_required: true,
    display_order: 4,
  },
]

// Membership plans for upgrade/pricing page
export const mockPlans = [
  {
    id: 'member',
    name: 'Member',
    description: 'Standard membership with essential benefits',
    price: 0,
    color: '#F97316',
    icon: '🥉',
    benefits: [
      'Free coffee at lunch',
      '10% off takeaway orders',
      '1 complimentary drink at brunch',
      'Birthday person eats free (tables 6+ people)',
    ],
  },
  {
    id: 'gold',
    name: 'Gold',
    description: 'Premium membership with enhanced benefits',
    price: 99,
    color: '#EAB308',
    icon: '🥇',
    benefits: [
      'All Member benefits',
      '15% off takeaway (upgraded)',
      'Priority reservations',
      'Exclusive events access',
    ],
  },
]

// Special coupons examples
export const mockCoupons = [
  {
    id: 'coupon-1',
    code: 'AERO22',
    title: 'Aeroespacial 2025',
    description: 'Special benefits for event attendees',
    is_active: true,
    redemptions: 45,
    max_redemptions: 100,
    valid_until: '2025-12-31',
  },
  {
    id: 'coupon-2',
    code: 'SUMMER24',
    title: 'Summer Special',
    description: 'Limited time summer promotion',
    is_active: true,
    redemptions: 12,
    max_redemptions: 50,
    valid_until: '2025-08-31',
  },
]
