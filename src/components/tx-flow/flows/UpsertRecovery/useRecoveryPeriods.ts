import chains from '@/config/chains'
import { useCurrentChain } from '@/hooks/useChains'

export const DAY_IN_SECONDS = 60 * 60 * 24

const DefaultRecoveryDelayPeriods = [
  {
    label: '2 days',
    value: `${DAY_IN_SECONDS * 2}`,
  },
  {
    label: '7 days',
    value: `${DAY_IN_SECONDS * 7}`,
  },
  {
    label: '14 days',
    value: `${DAY_IN_SECONDS * 14}`,
  },
  {
    label: '28 days',
    value: `${DAY_IN_SECONDS * 28}`,
  },
  {
    label: '56 days',
    value: `${DAY_IN_SECONDS * 56}`,
  },
]

const DefaultRecoveryExpirationPeriods = [
  {
    label: 'Never',
    value: '0',
  },
  ...DefaultRecoveryDelayPeriods,
]

const TestRecoveryDelayPeriods = [
  {
    label: '1 minute',
    value: 60,
  },
  {
    label: '5 minutes',
    value: 60 * 5,
  },
  {
    label: '1 hour',
    value: DAY_IN_SECONDS,
  },
  ...DefaultRecoveryDelayPeriods,
]

const TestRecoveryExpirationPeriods = [
  {
    label: 'Never',
    value: '0',
  },
  ...TestRecoveryDelayPeriods,
]

export function useRecoveryPeriods() {
  const chain = useCurrentChain()

  if (!chain || [chains.gor, chains.sep].includes(chain.chainId)) {
    return {
      delay: TestRecoveryDelayPeriods,
      expiration: TestRecoveryExpirationPeriods,
    }
  }

  return {
    delay: DefaultRecoveryDelayPeriods,
    expiration: DefaultRecoveryExpirationPeriods,
  }
}
