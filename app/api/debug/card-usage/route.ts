import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const memberId = searchParams.get('member_id')
    const limit = parseInt(searchParams.get('limit') || '50')

    // Get recent card usage records
    let query = supabase
      .from('card_usage')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (memberId) {
      query = query.eq('member_id', memberId)
    }

    const { data: records, error } = await query

    if (error) throw error

    // Group by transaction_id to find duplicates
    const byTransactionId: Record<string, any[]> = {}
    const withoutTransactionId: any[] = []

    records?.forEach(record => {
      if (record.transaction_id) {
        if (!byTransactionId[record.transaction_id]) {
          byTransactionId[record.transaction_id] = []
        }
        byTransactionId[record.transaction_id].push(record)
      } else {
        withoutTransactionId.push(record)
      }
    })

    // Find duplicates
    const duplicates = Object.entries(byTransactionId)
      .filter(([_, records]) => records.length > 1)
      .map(([txId, records]) => ({
        transaction_id: txId,
        count: records.length,
        records
      }))

    // Group by timestamp (within 1 second) to find potential duplicates
    const byTimestamp: Record<string, any[]> = {}
    records?.forEach(record => {
      const timestamp = new Date(record.created_at).getTime()
      const roundedTimestamp = Math.floor(timestamp / 1000) * 1000 // Round to second
      const key = `${record.member_id}_${record.event_type}_${roundedTimestamp}`
      
      if (!byTimestamp[key]) {
        byTimestamp[key] = []
      }
      byTimestamp[key].push(record)
    })

    const potentialDuplicates = Object.entries(byTimestamp)
      .filter(([_, records]) => records.length > 1)
      .map(([key, records]) => ({
        key,
        count: records.length,
        records
      }))

    return NextResponse.json({
      total_records: records?.length || 0,
      records: records || [],
      analysis: {
        duplicates_by_transaction_id: {
          count: duplicates.length,
          items: duplicates
        },
        records_without_transaction_id: {
          count: withoutTransactionId.length,
          items: withoutTransactionId.slice(0, 10) // Only show first 10
        },
        potential_duplicates_by_timestamp: {
          count: potentialDuplicates.length,
          items: potentialDuplicates
        }
      }
    })
  } catch (error: any) {
    console.error('Debug card usage error:', error)
    return NextResponse.json(
      {
        error: 'Error getting debug info',
        details: error.message,
      },
      { status: 500 }
    )
  }
}
