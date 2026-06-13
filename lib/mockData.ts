import { Profile, MatchEvent } from '../types'

export const mockProfiles: Profile[] = [
  {
    id: '1',
    name: 'Adewale Balogun',
    type: 'medical',
    status: 'active',
    enrolledAt: '2026-06-06',
    bloodType: 'O+',
    allergies: ['Penicillin', 'Latex'],
    conditions: ['Type-2 Diabetes'],
    emergencyContact: '+234 802 345 6789'
  },
  {
    id: '2',
    name: 'Emeka Okafor',
    type: 'watchlist',
    status: 'active',
    enrolledAt: '2026-06-07',
    threatLevel: 'high',
    reason: 'Unauthorized access attempt',
    flaggedBy: 'Officer Musa Aliyu'
  },
  {
    id: '3',
    name: 'Taiwo Adeyemi',
    type: 'missing',
    status: 'active',
    enrolledAt: '2026-06-07',
    lastSeen: 'Main hall',
    description: 'Female, age 8, wearing yellow dress',
    guardianContact: '+234 803 567 1234'
  }
]

export const mockAlerts: MatchEvent[] = [
  {
    id: 'a1',
    profile: mockProfiles[1],
    confidence: 97.4,
    camera: 'Gate A',
    timestamp: 'Just now',
    status: 'unresolved'
  },
  {
    id: 'a2',
    profile: mockProfiles[2],
    confidence: 91.2,
    camera: 'Main hall',
    timestamp: '2m ago',
    status: 'unresolved'
  },
  {
    id: 'a3',
    profile: mockProfiles[0],
    confidence: 94.1,
    camera: 'Medical tent',
    timestamp: '5m ago',
    status: 'unresolved'
  }
]
