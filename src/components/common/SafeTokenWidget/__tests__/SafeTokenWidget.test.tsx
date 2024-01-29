import * as nextRouter from 'next/router'
import useChainId from '@/hooks/useChainId'
import { render, waitFor } from '@/tests/test-utils'
import { SafeAppAccessPolicyTypes } from '@safe-global/safe-gateway-typescript-sdk'
import SafeTokenWidget from '..'
import { toBeHex } from 'ethers'
import { AppRoutes } from '@/config/routes'
import useSafeTokenAllocation, { useSafeVotingPower } from '@/hooks/useSafeTokenAllocation'

const MOCK_GOVERNANCE_APP_URL = 'https://mock.governance.safe.global'

jest.mock('@/hooks/useChainId', () => jest.fn(() => '1'))

jest.mock('@/hooks/useSafeTokenAllocation')

jest.mock(
  '@/hooks/safe-apps/useRemoteSafeApps',
  jest.fn(() => ({
    useRemoteSafeApps: () => [
      [
        {
          id: 61,
          url: MOCK_GOVERNANCE_APP_URL,
          chainIds: ['4'],
          name: 'Safe {DAO} Governance',
          description: '',
          iconUrl: '',
          tags: ['safe-dao-governance-app'],
          accessControl: {
            type: SafeAppAccessPolicyTypes.NoRestrictions,
          },
        },
      ],
    ],
  })),
)

describe('SafeTokenWidget', () => {
  const fakeSafeAddress = toBeHex('0x1', 20)
  beforeEach(() => {
    jest.restoreAllMocks()
    jest.spyOn(nextRouter, 'useRouter').mockImplementation(
      () =>
        ({
          query: {
            safe: fakeSafeAddress,
          },
        } as any),
    )
  })

  it('Should render nothing for unsupported chains', () => {
    ;(useChainId as jest.Mock).mockImplementationOnce(jest.fn(() => '100'))
    ;(useSafeTokenAllocation as jest.Mock).mockImplementation(() => [[], , false])
    ;(useSafeVotingPower as jest.Mock).mockImplementation(() => [BigInt(0), , false])

    const result = render(<SafeTokenWidget />)
    expect(result.baseElement).toContainHTML('<body><div /></body>')
  })

  it('Should display 0 if Safe has no SAFE token', async () => {
    ;(useSafeTokenAllocation as jest.Mock).mockImplementation(() => [[], , false])
    ;(useSafeVotingPower as jest.Mock).mockImplementation(() => [BigInt(0), , false])

    const result = render(<SafeTokenWidget />)
    await waitFor(() => expect(result.baseElement).toHaveTextContent('0'))
  })

  it('Should display the value formatted correctly', async () => {
    ;(useSafeTokenAllocation as jest.Mock).mockImplementation(() => [[], , false])
    ;(useSafeVotingPower as jest.Mock).mockImplementation(() => [BigInt('472238796133701648384'), , false])

    // to avoid failing tests in some environments
    const NumberFormat = Intl.NumberFormat
    const englishTestLocale = 'en'

    jest.spyOn(Intl, 'NumberFormat').mockImplementation((_, ...rest) => new NumberFormat([englishTestLocale], ...rest))

    const result = render(<SafeTokenWidget />)
    await waitFor(() => {
      expect(result.baseElement).toHaveTextContent('472.24')
      expect(result.baseElement).not.toHaveTextContent('472.2388')
    })
  })

  it('Should render a link to the governance app', async () => {
    ;(useSafeTokenAllocation as jest.Mock).mockImplementation(() => [[], , false])
    ;(useSafeVotingPower as jest.Mock).mockImplementation(() => [BigInt(420000), , false])

    const result = render(<SafeTokenWidget />)
    await waitFor(() => {
      expect(result.baseElement).toContainHTML(
        `href="${AppRoutes.apps.open}?safe=${fakeSafeAddress}&appUrl=${encodeURIComponent(MOCK_GOVERNANCE_APP_URL)}"`,
      )
    })
  })

  it('Should render a claim button for SEP5 qualification', async () => {
    ;(useSafeTokenAllocation as jest.Mock).mockImplementation(() => [[{ tag: 'user_v2' }], , false])
    ;(useSafeVotingPower as jest.Mock).mockImplementation(() => [BigInt(420000), , false])

    const result = render(<SafeTokenWidget />)
    await waitFor(() => {
      expect(result.baseElement).toContainHTML('New allocation')
    })
  })
})
