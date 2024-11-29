import { faker } from '@faker-js/faker'

import { render } from '@/tests/test-utils'
import { _SanctionWrapper } from '@/components/wrappers/SanctionWrapper'
import type { useGetIsSanctionedQuery } from '@/store/api/ofac'
import type useSafeInfo from '@/hooks/useSafeInfo'
import type useWallet from '@/hooks/wallets/useWallet'

describe('SanctionWrapper', () => {
  it('should render the children if neither the signer or Safe is sanctioned', () => {
    const safe = faker.finance.ethereumAddress()
    const wallet = faker.finance.ethereumAddress()

    const getSafeInfo = (() => {
      return { safeAddress: safe }
    }) as typeof useSafeInfo

    const getWallet = (() => {
      return { address: wallet }
    }) as typeof useWallet

    const isSanctioned = (() => {
      return { data: false }
    }) as typeof useGetIsSanctionedQuery

    const { queryByText } = render(
      <_SanctionWrapper featureTitle="test" getSafeInfo={getSafeInfo} getWallet={getWallet} isSanctioned={isSanctioned}>
        <>Not sanctioned</>
      </_SanctionWrapper>,
    )

    expect(queryByText('Not sanctioned')).toBeTruthy()
  })

  it('should render the disclaimer if the signer is sanctioned', () => {
    const safe = faker.finance.ethereumAddress()
    const wallet = faker.finance.ethereumAddress()

    const getSafeInfo = (() => {
      return { safeAddress: safe }
    }) as typeof useSafeInfo

    const getWallet = (() => {
      return { address: wallet }
    }) as typeof useWallet

    const isSanctioned = ((address: string) => {
      return { data: address === wallet }
    }) as typeof useGetIsSanctionedQuery

    const { queryByText } = render(
      <_SanctionWrapper featureTitle="test" getSafeInfo={getSafeInfo} getWallet={getWallet} isSanctioned={isSanctioned}>
        <>Not sanctioned</>
      </_SanctionWrapper>,
    )

    expect(queryByText('Not sanctioned')).toBeFalsy()
  })

  it('should render the disclaimer if the Safe is sanctioned', () => {
    const safe = faker.finance.ethereumAddress()
    const wallet = faker.finance.ethereumAddress()

    const getSafeInfo = (() => {
      return { safeAddress: safe }
    }) as typeof useSafeInfo

    const getWallet = (() => {
      return { address: wallet }
    }) as typeof useWallet

    const isSanctioned = ((address: string) => {
      return { data: address === safe }
    }) as typeof useGetIsSanctionedQuery

    const { queryByText } = render(
      <_SanctionWrapper featureTitle="test" getSafeInfo={getSafeInfo} getWallet={getWallet} isSanctioned={isSanctioned}>
        <>Not sanctioned</>
      </_SanctionWrapper>,
    )

    expect(queryByText('Blocked address')).toBeTruthy()
  })

  it('should render if the sanction list is loading', () => {
    const safe = faker.finance.ethereumAddress()
    const wallet = faker.finance.ethereumAddress()

    const getSafeInfo = (() => {
      return { safeAddress: safe }
    }) as typeof useSafeInfo

    const getWallet = (() => {
      return { address: wallet }
    }) as typeof useWallet

    const isSanctioned = (() => {
      return { data: undefined }
    }) as typeof useGetIsSanctionedQuery

    const { queryByText } = render(
      <_SanctionWrapper featureTitle="test" getSafeInfo={getSafeInfo} getWallet={getWallet} isSanctioned={isSanctioned}>
        <>Not sanctioned</>
      </_SanctionWrapper>,
    )

    expect(queryByText('Not sanctioned')).toBeTruthy()
  })
})
