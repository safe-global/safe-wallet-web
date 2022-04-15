import { ReactElement } from 'react'
import Link from 'next/link'
import useSafeAddress from 'services/useSafeAddress'
import { useAppSelector } from 'store'
import { selectSafeInfo } from 'store/safeInfoSlice'
import ChainIndicator from '../ChainIndicator'
import SafeHeader from '../SafeHeader'
import SafeList from '../SafeList'
import ErrorToast from '../ErrorToast'
import chains from 'config/chains'
import css from './styles.module.css'

const Sidebar = (): ReactElement => {
  const { address, chainId } = useSafeAddress()
  const { error, loading } = useAppSelector(selectSafeInfo)
  const shortName = Object.keys(chains).find((key) => chains[key] === chainId)

  return (
    <div className={css.container}>
      <div className={css.chain}>
        <ChainIndicator />
      </div>

      {!error && <SafeHeader />}

      <ul>
        <li>
          <Link href={`/${shortName}:${address}/balances`}>
            <a>Balances</a>
          </Link>
        </li>

        <li>
          <Link href={`/${shortName}:${address}/transactions`}>
            <a>Transactions</a>
          </Link>
        </li>
      </ul>

      {!error && <SafeList />}

      {loading && 'Loading Safe info...'}

      {error && <ErrorToast message="Failed loading the Safe" />}
    </div>
  )
}

export default Sidebar
