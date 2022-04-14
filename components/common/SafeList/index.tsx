import { getOwnedSafes, OwnedSafes } from '@gnosis.pm/safe-react-gateway-sdk'
import Web3 from 'web3'
import { GATEWAY_URL } from 'config/constants'
import { ReactElement } from 'react'
import useAsync from 'services/useAsync'
import css from './styles.module.css'
import Link from 'next/link'
import chains from 'config/chains'
import useSafeAddress from 'services/useSafeAddress'

const getOwned = (chainId: string, walletAddress: string): Promise<OwnedSafes> => {
  return getOwnedSafes(GATEWAY_URL, chainId, walletAddress)
}

const OwnedSafes = ({ safes, chainId }: { safes: string[]; chainId: string }) => {
  const shortName = Object.keys(chains).find((key) => chains[key] === chainId)

  return (
    <ul className={css.ownedSafes}>
      {safes.map((safeAddress) => (
        <li key={safeAddress}>
          <Link href={`/${shortName}:${safeAddress}/balances`}>
            <a>
              {safeAddress.slice(0, 6)}...{safeAddress.slice(-4)}
            </a>
          </Link>
        </li>
      ))}
    </ul>
  )
}

const SafeList = (): ReactElement => {
  const { chainId } = useSafeAddress()

  const [ownedSafes, error, loading] = useAsync<OwnedSafes | undefined>(async () => {
    // @FIXME
    const walletAddress = typeof window !== 'undefined' ? (window as any).ethereum?.selectedAddress || '' : ''
    if (!walletAddress || !chainId) return

    return getOwned(chainId, Web3.utils.toChecksumAddress(walletAddress))
  }, [chainId])

  return (
    <div className={css.container}>
      <h4>Owned Safes</h4>

      {loading && 'Loading owned Safes...'}

      {!loading && error && `Error loading owned Safes: ${error.message}`}

      {!loading && !error && <OwnedSafes safes={ownedSafes ? ownedSafes.safes : []} chainId={chainId} />}
    </div>
  )
}

export default SafeList
