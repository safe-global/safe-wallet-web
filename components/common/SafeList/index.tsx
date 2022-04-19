import { getOwnedSafes, OwnedSafes } from '@gnosis.pm/safe-react-gateway-sdk'
import Web3 from 'web3'
import { ReactElement } from 'react'
import useAsync from '@/services/useAsync'
import css from './styles.module.css'
import Link from 'next/link'
import chains from '@/config/chains'
import useSafeAddress from '@/services/useSafeAddress'
import { shortenAddress } from '@/services/formatters'

const OwnedSafes = ({ safes, chainId, safeAddress }: { safes: string[]; chainId: string; safeAddress: string }) => {
  const shortName = Object.keys(chains).find((key) => chains[key] === chainId)

  return (
    <ul className={css.ownedSafes}>
      {safes.map((address) => (
        <li key={address} className={address === safeAddress ? css.selected : undefined}>
          <Link href={`/${shortName}:${address}/balances`}>
            <a>{shortenAddress(address)}</a>
          </Link>
        </li>
      ))}
    </ul>
  )
}

const SafeList = (): ReactElement => {
  const { chainId, address } = useSafeAddress()

  const [ownedSafes, error, loading] = useAsync<OwnedSafes | undefined>(async () => {
    // @FIXME
    const walletAddress = typeof window !== 'undefined' ? (window as any).ethereum?.selectedAddress || '' : ''
    if (!walletAddress || !chainId) return

    return getOwnedSafes(chainId, Web3.utils.toChecksumAddress(walletAddress))
  }, [chainId])

  return (
    <div className={css.container}>
      <h4>Owned Safes</h4>

      {loading && 'Loading owned Safes...'}

      {!loading && error && `Error loading owned Safes: ${error.message}`}

      {!loading && !error && (
        <OwnedSafes safes={ownedSafes ? ownedSafes.safes : []} chainId={chainId} safeAddress={address} />
      )}
    </div>
  )
}

export default SafeList
