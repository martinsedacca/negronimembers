/**
 * GoHighLevel Contact Sync Service
 * Syncs membership data to GHL contacts using the MCP server
 */

interface GHLContact {
  id?: string
  locationId: string
  email?: string
  phone?: string
  firstName?: string
  lastName?: string
  tags?: string[]
  customFields?: Array<{
    id: string
    value: string | number
  }>
}

interface MemberData {
  id: string
  full_name: string
  email: string
  phone: string | null
  member_number: string
  membership_type: string
  status: string
  points: number
  joined_date: string
  total_visits?: number
  lifetime_spent?: number
  last_visit?: string | null
  average_purchase?: number
}

export class GHLSyncService {
  private apiUrl = 'https://services.leadconnectorhq.com/mcp/'
  private token: string
  private locationId: string

  constructor(token: string, locationId: string) {
    this.token = token
    this.locationId = locationId
  }

  /**
   * Custom fields mapping for membership data
   * These need to be created in GHL first
   */
  private getCustomFieldsMap() {
    return {
      member_number: 'membership_number', // ID del custom field en GHL
      membership_type: 'membership_tier',
      points: 'membership_points',
      status: 'membership_status',
      total_visits: 'total_visits',
      lifetime_spent: 'lifetime_spent',
      last_visit: 'last_visit_date',
      average_purchase: 'average_purchase_amount',
    }
  }

  /**
   * Get tags based on membership type and status
   */
  private getMembershipTags(member: MemberData): string[] {
    const tags: string[] = ['membership']

    // Status tag
    if (member.status === 'active') {
      tags.push('membership_active')
    } else {
      tags.push('membership_inactive')
    }

    // Tier tag
    tags.push(`tier_${member.membership_type.toLowerCase()}`)

    return tags
  }

  /**
   * Search for existing contact by email or phone
   */
  async findContact(email: string, phone?: string | null): Promise<string | null> {
    try {
      const headers = {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      }

      // Search by email
      if (email) {
        const response = await fetch(
          `https://services.leadconnectorhq.com/contacts/search?locationId=${this.locationId}&email=${encodeURIComponent(email)}`,
          { headers }
        )

        if (response.ok) {
          const data = await response.json()
          if (data.contacts && data.contacts.length > 0) {
            return data.contacts[0].id
          }
        }
      }

      // If not found by email, try phone
      if (phone) {
        const cleanPhone = phone.replace(/\D/g, '') // Remove non-digits
        const response = await fetch(
          `https://services.leadconnectorhq.com/contacts/search?locationId=${this.locationId}&phone=${cleanPhone}`,
          { headers }
        )

        if (response.ok) {
          const data = await response.json()
          if (data.contacts && data.contacts.length > 0) {
            return data.contacts[0].id
          }
        }
      }

      return null
    } catch (error) {
      console.error('Error searching contact:', error)
      return null
    }
  }

  /**
   * Create new contact in GHL
   */
  async createContact(member: MemberData): Promise<string | null> {
    try {
      const [firstName, ...lastNameParts] = member.full_name.split(' ')
      const lastName = lastNameParts.join(' ')

      const contactData = {
        locationId: this.locationId,
        firstName,
        lastName,
        email: member.email,
        phone: member.phone || undefined,
        tags: this.getMembershipTags(member),
        customFields: this.buildCustomFields(member),
      }

      const response = await fetch('https://services.leadconnectorhq.com/contacts/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactData),
      })

      if (!response.ok) {
        const error = await response.text()
        console.error('Error creating contact:', error)
        return null
      }

      const data = await response.json()
      return data.contact?.id || null
    } catch (error) {
      console.error('Error creating contact:', error)
      return null
    }
  }

  /**
   * Update existing contact in GHL
   */
  async updateContact(contactId: string, member: MemberData): Promise<boolean> {
    try {
      const [firstName, ...lastNameParts] = member.full_name.split(' ')
      const lastName = lastNameParts.join(' ')

      const updateData = {
        firstName,
        lastName,
        email: member.email,
        phone: member.phone || undefined,
        tags: this.getMembershipTags(member),
        customFields: this.buildCustomFields(member),
      }

      const response = await fetch(
        `https://services.leadconnectorhq.com/contacts/${contactId}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData),
        }
      )

      if (!response.ok) {
        const error = await response.text()
        console.error('Error updating contact:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error updating contact:', error)
      return false
    }
  }

  /**
   * Build custom fields array from member data
   */
  private buildCustomFields(member: MemberData): Array<{ id: string; value: string | number }> {
    const fields: Array<{ id: string; value: string | number }> = []
    const fieldMap = this.getCustomFieldsMap()

    // Add member number
    fields.push({
      id: fieldMap.member_number,
      value: member.member_number,
    })

    // Add membership type/tier
    fields.push({
      id: fieldMap.membership_type,
      value: member.membership_type,
    })

    // Add points
    fields.push({
      id: fieldMap.points,
      value: member.points,
    })

    // Add status
    fields.push({
      id: fieldMap.status,
      value: member.status,
    })

    // Add stats if available
    if (member.total_visits !== undefined) {
      fields.push({
        id: fieldMap.total_visits,
        value: member.total_visits,
      })
    }

    if (member.lifetime_spent !== undefined) {
      fields.push({
        id: fieldMap.lifetime_spent,
        value: member.lifetime_spent,
      })
    }

    if (member.last_visit) {
      fields.push({
        id: fieldMap.last_visit,
        value: new Date(member.last_visit).toISOString().split('T')[0], // YYYY-MM-DD
      })
    }

    if (member.average_purchase !== undefined) {
      fields.push({
        id: fieldMap.average_purchase,
        value: member.average_purchase,
      })
    }

    return fields
  }

  /**
   * Sync member to GHL contact (create or update)
   */
  async syncMember(member: MemberData): Promise<{ success: boolean; contactId?: string; created?: boolean }> {
    try {
      // Check if contact exists
      const existingContactId = await this.findContact(member.email, member.phone)

      if (existingContactId) {
        // Update existing contact
        const success = await this.updateContact(existingContactId, member)
        return {
          success,
          contactId: existingContactId,
          created: false,
        }
      } else {
        // Create new contact
        const contactId = await this.createContact(member)
        return {
          success: !!contactId,
          contactId: contactId || undefined,
          created: true,
        }
      }
    } catch (error) {
      console.error('Error syncing member:', error)
      return { success: false }
    }
  }

  /**
   * Bulk sync multiple members
   */
  async syncMembers(members: MemberData[]): Promise<{
    total: number
    synced: number
    created: number
    updated: number
    failed: number
  }> {
    const results = {
      total: members.length,
      synced: 0,
      created: 0,
      updated: 0,
      failed: 0,
    }

    for (const member of members) {
      const result = await this.syncMember(member)
      
      if (result.success) {
        results.synced++
        if (result.created) {
          results.created++
        } else {
          results.updated++
        }
      } else {
        results.failed++
      }

      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    return results
  }
}
