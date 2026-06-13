export type MatchType = 'watchlist' | 'missing' | 'medical'

export type Profile = {
  id: string
  name: string
  type: MatchType
  status: 'active' | 'resolved'
  enrolledAt: string
  // Medical fields
  bloodType?: string
  allergies?: string[]
  conditions?: string[]
  emergencyContact?: string
  // Watchlist fields
  threatLevel?: 'high' | 'medium' | 'low'
  reason?: string
  flaggedBy?: string
  // Missing fields
  lastSeen?: string
  description?: string
  guardianContact?: string
}

export type MatchEvent = {
  id: string
  profile: Profile
  confidence: number
  camera: string
  timestamp: string
  status: 'unresolved' | 'confirmed' | 'dismissed'
}

export type ScanResult = {
  matched: boolean
  confidence: number
  profile: Profile | null
}
