import type { Plan } from '@/types/Plan'

export const LITE_PLAN: Plan = {
  title: 'Lite',
  ppm: 15,
  features: [
    '5 Feeds',
    '5 Users',
  ],
  externalId: {
    stripe: process.env.NEXT_PUBLIC_STRIPE_ESP_LITE_PLAN,
  },
}

export const STANDARD_PLAN: Plan = {
  title: 'Standard',
  ppm: 50,
  features: [
    '10 Feeds',
    '25 Users',
  ],
  externalId: {
    stripe: process.env.NEXT_PUBLIC_STRIPE_ESP_STANDARD_PLAN,
  },
}

export const PREMIUM_PLAN: Plan = {
  title: 'Premium',
  ppm: 100,
  features: [
    '50 Feeds',
    '125 Users',
  ],
  externalId: {
    stripe: process.env.NEXT_PUBLIC_STRIPE_ESP_PREMIUM_PLAN,
  },
}
