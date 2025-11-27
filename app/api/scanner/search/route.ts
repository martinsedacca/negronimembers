import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { query } = await request.json()

    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { error: 'Search query must be at least 2 characters' },
        { status: 400 }
      )
    }

    const searchTerm = query.trim().toLowerCase()
    
    // Check if it's an email
    const isEmail = searchTerm.includes('@')
    
    // Check if it's a phone number (contains only digits, +, -, spaces, parentheses)
    const isPhone = /^[\d\s\-+()]+$/.test(searchTerm) && searchTerm.replace(/\D/g, '').length >= 6
    
    // Check if it's a member number (starts with MEM or is alphanumeric)
    const isMemberNumber = /^mem/i.test(searchTerm) || /^[a-z0-9]+$/i.test(searchTerm)

    let members: any[] = []

    if (isEmail) {
      // Search by email
      const { data } = await supabase
        .from('members')
        .select('id, full_name, email, phone, member_number, membership_type, status, points')
        .ilike('email', `%${searchTerm}%`)
        .limit(10)
      members = data || []
    } else if (isPhone) {
      // Search by phone - remove all non-digits for comparison
      const phoneDigits = searchTerm.replace(/\D/g, '')
      const { data } = await supabase
        .from('members')
        .select('id, full_name, email, phone, member_number, membership_type, status, points')
        .or(`phone.ilike.%${phoneDigits}%,phone.ilike.%${searchTerm}%`)
        .limit(10)
      members = data || []
    } else {
      // Search by name - split into words and search for any combination
      const words = searchTerm.split(/\s+/).filter((w: string) => w.length >= 2)
      
      if (words.length === 0) {
        return NextResponse.json({ members: [] })
      }

      // Build a query that matches all words in any order
      // Using ilike with each word
      let query = supabase
        .from('members')
        .select('id, full_name, email, phone, member_number, membership_type, status, points')

      // Each word must appear somewhere in full_name
      for (const word of words) {
        query = query.ilike('full_name', `%${word}%`)
      }

      const { data: nameResults } = await query.limit(10)
      members = nameResults || []

      // Also search by member_number if it looks like one
      if (isMemberNumber && members.length < 10) {
        const { data: numberResults } = await supabase
          .from('members')
          .select('id, full_name, email, phone, member_number, membership_type, status, points')
          .ilike('member_number', `%${searchTerm}%`)
          .limit(5)
        
        // Add unique results
        if (numberResults) {
          for (const result of numberResults) {
            if (!members.find(m => m.id === result.id)) {
              members.push(result)
            }
          }
        }
      }
    }

    return NextResponse.json({ 
      members: members.slice(0, 10),
      search_type: isEmail ? 'email' : isPhone ? 'phone' : 'name'
    })
  } catch (error: any) {
    console.error('Scanner search error:', error)
    return NextResponse.json(
      { error: 'Error searching members', details: error.message },
      { status: 500 }
    )
  }
}
