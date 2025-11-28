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
  membership_type: string // Tier name
  membership_type_id?: string | null // FK to membership_types
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
  private customFieldsCache: Map<string, string> | null = null

  constructor(token: string, locationId: string) {
    this.token = token
    this.locationId = locationId
  }

  /**
   * Required custom fields definition
   */
  private getRequiredCustomFields() {
    return [
      { key: 'member_number', name: 'Membership Number', dataType: 'TEXT' },
      { key: 'member_tier', name: 'Member Tier', dataType: 'TEXT' },
      { key: 'member_points', name: 'Member Points', dataType: 'NUMERICAL' },
      { key: 'member_status', name: 'Member Status', dataType: 'TEXT' },
      { key: 'member_visits', name: 'Member Visits', dataType: 'NUMERICAL' },
      { key: 'member_spent', name: 'Member Spent', dataType: 'NUMERICAL' },
      { key: 'member_last_visit', name: 'Member Last Visit', dataType: 'TEXT' },
      { key: 'member_avg_purchase', name: 'Member Avg Purchase', dataType: 'NUMERICAL' },
    ]
  }

  /**
   * Fetch existing custom fields from GHL
   */
  private async fetchCustomFields(): Promise<Map<string, string>> {
    try {
      console.log('🔵 [GHLSync] Fetching custom fields from GHL...')
      
      const response = await fetch(
        `https://services.leadconnectorhq.com/locations/${this.locationId}/customFields`,
        {
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json',
            'Version': '2021-07-28',
          },
        }
      )

      if (!response.ok) {
        const error = await response.text()
        console.error('🔴 [GHLSync] Error fetching custom fields:', error)
        return new Map()
      }

      const data = await response.json()
      const fieldMap = new Map<string, string>()

      // Map field names to IDs
      if (data.customFields && Array.isArray(data.customFields)) {
        for (const field of data.customFields) {
          // Normalize field name for matching
          const normalizedName = field.name.toLowerCase().replace(/\s+/g, '_')
          fieldMap.set(normalizedName, field.id)
          console.log(`🔵 [GHLSync] Found field: ${field.name} -> ${field.id}`)
        }
      }

      return fieldMap
    } catch (error) {
      console.error('🔴 [GHLSync] Exception fetching custom fields:', error)
      return new Map()
    }
  }

  /**
   * Create a custom field in GHL
   */
  private async createCustomField(name: string, dataType: string): Promise<string | null> {
    try {
      console.log(`🔵 [GHLSync] Creating custom field: ${name} (${dataType})`)

      const response = await fetch(
        `https://services.leadconnectorhq.com/locations/${this.locationId}/customFields`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json',
            'Version': '2021-07-28',
          },
          body: JSON.stringify({
            name,
            dataType,
            model: 'contact',
          }),
        }
      )

      if (!response.ok) {
        const error = await response.text()
        console.error(`🔴 [GHLSync] Error creating field ${name}:`, error)
        return null
      }

      const data = await response.json()
      console.log(`✅ [GHLSync] Created field: ${name} -> ${data.customField.id}`)
      return data.customField?.id || null
    } catch (error) {
      console.error(`🔴 [GHLSync] Exception creating field ${name}:`, error)
      return null
    }
  }

  /**
   * Ensure all required custom fields exist in GHL
   */
  async ensureCustomFields(): Promise<Map<string, string>> {
    // Return cached fields if available
    if (this.customFieldsCache) {
      return this.customFieldsCache
    }

    console.log('🔵 [GHLSync] Ensuring custom fields exist...')
    
    const existingFields = await this.fetchCustomFields()
    const requiredFields = this.getRequiredCustomFields()
    const fieldMap = new Map<string, string>()

    for (const field of requiredFields) {
      const normalizedKey = field.key.toLowerCase().replace(/\s+/g, '_')
      const normalizedName = field.name.toLowerCase().replace(/\s+/g, '_')

      // Check if field already exists
      let fieldId = existingFields.get(normalizedKey) || existingFields.get(normalizedName)

      // If not found, create it
      if (!fieldId) {
        console.log(`⚠️ [GHLSync] Field not found, creating: ${field.name}`)
        const newFieldId = await this.createCustomField(field.name, field.dataType)
        
        if (newFieldId) {
          fieldId = newFieldId
          // Add small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 200))
        }
      }

      if (fieldId) {
        fieldMap.set(field.key, fieldId)
      }
    }

    // Cache the result
    this.customFieldsCache = fieldMap
    
    console.log('✅ [GHLSync] Custom fields ready:', Array.from(fieldMap.entries()))
    return fieldMap
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
        'Version': '2021-07-28',
      }

      // Search by email
      if (email) {
        console.log('🔵 [GHLSync] Searching contact by email:', email)
        const searchUrl = `https://services.leadconnectorhq.com/contacts/search?locationId=${this.locationId}&email=${encodeURIComponent(email)}`
        console.log('🔵 [GHLSync] Search URL:', searchUrl)
        
        const response = await fetch(searchUrl, { headers })
        console.log('🔵 [GHLSync] Search response status:', response.status, response.statusText)

        if (response.ok) {
          const data = await response.json()
          console.log('🔵 [GHLSync] Search response data:', data)
          
          if (data.contacts && data.contacts.length > 0) {
            console.log('✅ [GHLSync] Found contact by email:', data.contacts[0].id)
            return data.contacts[0].id
          } else {
            console.log('⚠️ [GHLSync] No contacts found by email')
          }
        } else {
          const errorText = await response.text()
          console.error('🔴 [GHLSync] Search by email failed:', errorText)
        }
      }

      // If not found by email, try phone
      if (phone) {
        const cleanPhone = phone.replace(/\D/g, '') // Remove non-digits
        console.log('🔵 [GHLSync] Searching contact by phone:', cleanPhone)
        
        const searchUrl = `https://services.leadconnectorhq.com/contacts/search?locationId=${this.locationId}&phone=${cleanPhone}`
        console.log('🔵 [GHLSync] Search URL:', searchUrl)
        
        const response = await fetch(searchUrl, { headers })
        console.log('🔵 [GHLSync] Search response status:', response.status, response.statusText)

        if (response.ok) {
          const data = await response.json()
          console.log('🔵 [GHLSync] Search response data:', data)
          
          if (data.contacts && data.contacts.length > 0) {
            console.log('✅ [GHLSync] Found contact by phone:', data.contacts[0].id)
            return data.contacts[0].id
          } else {
            console.log('⚠️ [GHLSync] No contacts found by phone')
          }
        } else {
          const errorText = await response.text()
          console.error('🔴 [GHLSync] Search by phone failed:', errorText)
        }
      }

      console.log('⚠️ [GHLSync] Contact not found by email or phone')
      return null
    } catch (error) {
      console.error('🔴 [GHLSync] Exception in findContact:', error)
      return null
    }
  }

  /**
   * Create new contact in GHL
   */
  async createContact(member: MemberData, fieldMap: Map<string, string>): Promise<{ success: boolean; contactId?: string; error?: string }> {
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
        customFields: this.buildCustomFields(member, fieldMap),
      }

      console.log('🔵 [GHLSync] Creating contact with data:', JSON.stringify(contactData, null, 2))

      const response = await fetch('https://services.leadconnectorhq.com/contacts/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
          'Version': '2021-07-28',
        },
        body: JSON.stringify(contactData),
      })

      console.log('🔵 [GHLSync] Create response status:', response.status, response.statusText)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('🔴 [GHLSync] Error creating contact:', errorText)
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`
        try {
          const errorData = JSON.parse(errorText)
          errorMessage = errorData.message || errorData.error || errorMessage
        } catch {
          errorMessage = errorText || errorMessage
        }
        return { success: false, error: errorMessage }
      }

      const data = await response.json()
      console.log('🔵 [GHLSync] Create response data:', data)
      const contactId = data.contact?.id
      
      if (!contactId) {
        return { success: false, error: 'No contact ID in response' }
      }
      
      return { success: true, contactId }
    } catch (error: any) {
      console.error('🔴 [GHLSync] Exception in createContact:', error)
      return { success: false, error: error.message || 'Unknown error in createContact' }
    }
  }

  /**
   * Update existing contact in GHL
   */
  async updateContact(contactId: string, member: MemberData, fieldMap: Map<string, string>): Promise<{ success: boolean; error?: string }> {
    try {
      const [firstName, ...lastNameParts] = member.full_name.split(' ')
      const lastName = lastNameParts.join(' ')

      const updateData = {
        firstName,
        lastName,
        email: member.email,
        phone: member.phone || undefined,
        tags: this.getMembershipTags(member),
        customFields: this.buildCustomFields(member, fieldMap),
      }

      console.log('🔵 [GHLSync] Updating contact with data:', JSON.stringify(updateData, null, 2))

      const response = await fetch(
        `https://services.leadconnectorhq.com/contacts/${contactId}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json',
            'Version': '2021-07-28',
          },
          body: JSON.stringify(updateData),
        }
      )

      console.log('🔵 [GHLSync] Update response status:', response.status, response.statusText)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('🔴 [GHLSync] Error updating contact:', errorText)
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`
        try {
          const errorData = JSON.parse(errorText)
          errorMessage = errorData.message || errorData.error || errorMessage
        } catch {
          errorMessage = errorText || errorMessage
        }
        return { success: false, error: errorMessage }
      }

      const data = await response.json()
      console.log('🔵 [GHLSync] Update response data:', data)
      return { success: true }
    } catch (error: any) {
      console.error('🔴 [GHLSync] Exception in updateContact:', error)
      return { success: false, error: error.message || 'Unknown error in updateContact' }
    }
  }

  /**
   * Build custom fields array from member data
   */
  private buildCustomFields(member: MemberData, fieldMap: Map<string, string>): Array<{ id: string; value: string | number }> {
    const fields: Array<{ id: string; value: string | number }> = []

    console.log('🔵 [GHLSync] Building custom fields with field map:', Array.from(fieldMap.entries()))

    // Helper to add field if ID exists
    const addField = (key: string, value: string | number | undefined | null) => {
      const fieldId = fieldMap.get(key)
      if (fieldId && value !== undefined && value !== null) {
        fields.push({ id: fieldId, value })
        console.log(`🔵 [GHLSync] Added field: ${key} = ${value} (ID: ${fieldId})`)
      } else if (!fieldId) {
        console.log(`⚠️ [GHLSync] Skipping field ${key}: No field ID found in map`)
      }
    }

    // Add all member data
    addField('member_number', member.member_number)
    addField('member_tier', member.membership_type)
    addField('member_points', member.points)
    addField('member_status', member.status)
    addField('member_visits', member.total_visits ?? 0)
    addField('member_spent', member.lifetime_spent ?? 0)
    addField('member_avg_purchase', member.average_purchase ?? 0)
    
    // Format last visit date
    if (member.last_visit) {
      const formattedDate = new Date(member.last_visit).toISOString().split('T')[0]
      addField('member_last_visit', formattedDate)
    } else {
      addField('member_last_visit', 'Never')
    }

    return fields
  }

  /**
   * Sync member to GHL contact (create or update)
   */
  async syncMember(member: MemberData, storedContactId?: string | null): Promise<{ success: boolean; contactId?: string; created?: boolean; error?: string }> {
    try {
      console.log('🔵 [GHLSync] Starting sync for:', member.email)
      
      // Ensure custom fields exist first
      const fieldMap = await this.ensureCustomFields()
      
      // Check if contact exists (use stored ID first, then search)
      let existingContactId = storedContactId || null
      
      if (!existingContactId) {
        console.log('🔵 [GHLSync] No stored contact ID, searching in GHL...')
        existingContactId = await this.findContact(member.email, member.phone)
        console.log('🔵 [GHLSync] Search result:', existingContactId ? `Found: ${existingContactId}` : 'Not found')
      } else {
        console.log('🔵 [GHLSync] Using stored contact ID:', existingContactId)
      }

      if (existingContactId) {
        // Update existing contact
        console.log('🔵 [GHLSync] Updating existing contact:', existingContactId)
        const updateResult = await this.updateContact(existingContactId, member, fieldMap)
        console.log('🔵 [GHLSync] Update result:', updateResult)
        return {
          success: updateResult.success,
          contactId: existingContactId,
          created: false,
          error: updateResult.error,
        }
      } else {
        // Create new contact
        console.log('🔵 [GHLSync] Creating new contact...')
        const createResult = await this.createContact(member, fieldMap)
        console.log('🔵 [GHLSync] Create result:', createResult)
        return {
          success: createResult.success,
          contactId: createResult.contactId,
          created: true,
          error: createResult.error,
        }
      }
    } catch (error: any) {
      console.error('🔴 [GHLSync] Error syncing member:', error)
      return { 
        success: false,
        error: error.message || 'Unknown error',
      }
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
