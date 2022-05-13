import type { ReactElement } from 'react'
import { getOwnedSafes, type OwnedSafes } from '@gnosis.pm/safe-react-gateway-sdk'

import useAsync from '@/services/useAsync'
import Link from 'next/link'
import chains from '@/config/chains'
import useSafeAddress from '@/services/useSafeAddress'
import { shortenAddress } from '@/services/formatters'
import useWallet from '@/services/wallets/useWallet'
import css from '@/components/common/SafeList/styles.module.css'
import { useAppSelector } from '@/store'
import { selectAddedSafes } from '@/store/addedSafesSlice'
import useAddressBook from '@/services/useAddressBook'

const SafesList = ({ safes, chainId, safeAddress }: { safes: string[]; chainId: string; safeAddress: string }) => {
  const shortName = Object.keys(chains).find((key) => chains[key] === chainId)
  const addressBook = useAddressBook()

  return (
    <ul className={css.ownedSafes}>
      {safes.map((address) => (
        <li key={address} className={address === safeAddress ? css.selected : undefined}>
          <Link href={`/safe/balances?safe=${shortName}:${address}`}>
            <a>
              {addressBook[address] ? <div>{addressBook[address]}</div> : null}
              {shortenAddress(address)}
            </a>
          </Link>
        </li>
      ))}
    </ul>
  )
}

const AllSafes = (): ReactElement | null => {
  const { address, chainId } = useSafeAddress()
  const wallet = useWallet()
  const walletAddress = wallet?.address
  const addedSafes = useAppSelector((state) => selectAddedSafes(state, chainId))

  const [ownedSafes, error, loading] = useAsync<OwnedSafes | undefined>(async () => {
    if (!walletAddress || !chainId) return
    return getOwnedSafes(chainId, walletAddress)
  }, [chainId, walletAddress])

  return (
    <div className={css.container}>
      <h4>Added Safes</h4>

      <SafesList safes={addedSafes} chainId={chainId} safeAddress={address} />

      {wallet && (
        <>
          <h4>Owned Safes</h4>

          {loading && 'Loading owned Safes...'}

          {!loading && error && `Error loading owned Safes: ${error.message}`}

          {!loading && !error && (
            <SafesList safes={ownedSafes ? ownedSafes.safes : []} chainId={chainId} safeAddress={address} />
          )}
        </>
      )}
    </div>
  )
}

export default AllSafes
