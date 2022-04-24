import type { ReactElement } from 'react'
import { getOwnedSafes, type OwnedSafes } from '@gnosis.pm/safe-react-gateway-sdk'

import useAsync from '@/services/useAsync'
import Link from 'next/link'
import chains from '@/config/chains'
import useSafeAddress from '@/services/useSafeAddress'
import { shortenAddress } from '@/services/formatters'
import useWallet from '@/services/wallets/useWallet'
import css from '@/components/common/SafeList/styles.module.css'

const OwnedSafesList = ({ safes, chainId, safeAddress }: { safes: string[]; chainId: string; safeAddress: string }) => {
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
  const wallet = useWallet()

  const [ownedSafes, error, loading] = useAsync<OwnedSafes | undefined>(async () => {
    if (!wallet?.address || !chainId) return
    return getOwnedSafes(chainId, wallet.address)
  }, [chainId, wallet?.address])

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
