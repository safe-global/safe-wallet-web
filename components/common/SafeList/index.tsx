import Web3 from 'web3'
import type { ReactElement } from 'react'
import { getOwnedSafes, type OwnedSafes } from '@gnosis.pm/safe-react-gateway-sdk'

import useAsync from '@/services/useAsync'
import Link from 'next/link'
import chains from '@/config/chains'
import useSafeAddress from '@/services/useSafeAddress'
import { shortenAddress } from '@/services/formatters'
import { useWalletAddress } from '@/services/useOnboard'
import css from '@/components/common/SafeList/styles.module.css'

const OwnedSafesList = ({ safes, chainId, safeAddress }: { safes: string[]; chainId: string; safeAddress: string }) => {
  const shortName = Object.keys(chains).find((key) => chains[key] === chainId)

  return (
    <ul className={css.ownedSafes}>
      {safes.map((address) => (
        <li key={address} className={address === safeAddress ? css.selected : undefined}>
          <Link href={`/safe/balances?safe=${shortName}:${address}`}>
            <a>{shortenAddress(address)}</a>
          </Link>
        </li>
      ))}
    </ul>
  )
}

const SafeList = (): ReactElement => {
  const { chainId, address } = useSafeAddress()
  const walletAddress = useWalletAddress()

  const [ownedSafes, error, loading] = useAsync<OwnedSafes | undefined>(async () => {
    if (!walletAddress || !chainId) return
    return getOwnedSafes(chainId, Web3.utils.toChecksumAddress(walletAddress))
  }, [chainId, walletAddress])

  return (
    <div className={css.container}>
      <h4>Owned Safes</h4>

      {loading && 'Loading owned Safes...'}

      {!loading && error && `Error loading owned Safes: ${error.message}`}

      {!loading && !error && (
        <OwnedSafesList safes={ownedSafes ? ownedSafes.safes : []} chainId={chainId} safeAddress={address} />
      )}
    </div>
  )
}

export default SafeList
