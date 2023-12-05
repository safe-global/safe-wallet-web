import chains from '@/config/chains'
import { useCurrentChain } from '@/hooks/useChains'

export const DAY_IN_SECONDS = 60 * 60 * 24

type Periods = Array<{ label: string; value: string | number }>

const DefaultRecoveryDelayPeriods: Periods = [
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

const DefaultRecoveryExpirationPeriods: Periods = [
  {
    label: 'Never',
    value: '0',
  },
  ...DefaultRecoveryDelayPeriods,
]

const TestRecoveryDelayPeriods: Periods = [
  {
    label: '1 minute',
    value: '60',
  },
  {
    label: '5 minutes',
    value: `${60 * 5}`,
  },
  {
    label: '1 hour',
    value: `${60 * 60}`,
  },
  ...DefaultRecoveryDelayPeriods,
]

const TestRecoveryExpirationPeriods: Periods = [
  {
    label: 'Never',
    value: '0',
  },
  ...TestRecoveryDelayPeriods,
]

export function useRecoveryPeriods(): { delay: Periods; expiration: Periods } {
  const chain = useCurrentChain()
  const isTestChain = chain && [chains.gor, chains.sep].includes(chain.chainId)

  // TODO: Remove constant before release
  // eslint-disable-next-line no-constant-condition
  if (isTestChain) {
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
