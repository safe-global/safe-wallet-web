import Link from 'next/link'
import { getOwnedSafes, OwnedSafes } from '@gnosis.pm/safe-react-gateway-sdk'
import Web3 from 'web3'
import { ReactElement } from 'react'

import { GATEWAY_URL } from 'config/constants'
import useAsync from 'services/useAsync'
import { selectSafeInfo } from 'store/safeInfoSlice'
import { useAppSelector } from 'store'
import css from './styles.module.css'
import { selectChains } from 'store/chainsSlice'

const getOwned = (chainId: string, walletAddress: string): Promise<OwnedSafes> => {
  return getOwnedSafes(GATEWAY_URL, chainId, walletAddress)
}

const OwnedSafes = ({ safes, chainId }: { safes: string[]; chainId: string }) => {
  const chains = useAppSelector(selectChains)
  const shortName = chains.find((chain) => chain.chainId === chainId)?.shortName || ''

  return (
    <ul className={css.ownedSafes}>
      {safes.map((safeAddress) => (
        <li key={safeAddress}>
          {/* @FIXME */}
          <Link href={`/${shortName}:${safeAddress}/balances`}>
            <a>
              {/* @FIXME */}
              {safeAddress.slice(0, 6)}...{safeAddress.slice(-4)}
            </a>
          </Link>
        </li>
      ))}
    </ul>
  )
}

const SafeList = (): ReactElement => {
  const { safe } = useAppSelector(selectSafeInfo)
  const { chainId } = safe

  const [ownedSafes, error, loading] = useAsync<OwnedSafes | undefined>(() => {
    // @FIXME
    const walletAddress = typeof window !== 'undefined' ? (window as any).ethereum?.selectedAddress || '' : ''

    if (!walletAddress || !chainId) return Promise.resolve(undefined)

    return getOwned(chainId, Web3.utils.toChecksumAddress(walletAddress))
  }, [chainId])

  return (
    <div className={css.container}>
      {loading && 'Loading owned Safes...'}

      <h4>Owned Safes</h4>
      <OwnedSafes safes={ownedSafes ? ownedSafes.safes : []} chainId={chainId} />
    </div>
  )
}

export default SafeList
