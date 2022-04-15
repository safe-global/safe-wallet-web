import { ReactElement } from 'react'
<<<<<<< HEAD
import {SafeTransactionDataPartial} from "@gnosis.pm/safe-core-sdk-types";

=======
import Link from 'next/link'
>>>>>>> 49ed6aca59d3dd4911b880c1c8537645ab61a885
import useSafeAddress from 'services/useSafeAddress'
import { useAppSelector } from 'store'
import { selectSafeInfo } from 'store/safeInfoSlice'
import ChainIndicator from '../ChainIndicator'
import SafeHeader from '../SafeHeader'
import SafeList from '../SafeList'
import chains from 'config/chains'
import css from './styles.module.css'
import {getSafeSDK} from "utils/web3";

const Sidebar = (): ReactElement => {
<<<<<<< HEAD
  const { loading, error } = useAppSelector(selectSafeInfo)
  const { address, chainId } = useSafeAddress()
  const chainConfig = useAppSelector((state) => selectChainById(state, chainId))
=======
  const { address, chainId } = useSafeAddress()
  const { safe, error } = useAppSelector(selectSafeInfo)
  const loading = safe.address.value !== address
  const shortName = Object.keys(chains).find((key) => chains[key] === chainId)
>>>>>>> 49ed6aca59d3dd4911b880c1c8537645ab61a885

  const handleCreateTransaction = async () => {
    const safeSdk = getSafeSDK()
    // TODO: Get these values from a form
    const nonce = await safeSdk.getNonce()
    const transaction: SafeTransactionDataPartial = {
      nonce,
      to: address,
      value: "1",
      data: '0x'
    }

    const safeTransaction = await safeSdk.createTransaction(transaction)
    const executeTxResponse = await safeSdk.executeTransaction(safeTransaction)
    await executeTxResponse.transactionResponse?.wait()
  }

  return (
    <div className={css.container}>
      <div className={css.chain}>
        <ChainIndicator />
      </div>

      {!error && <SafeHeader />}

      <ul>
        <li>
          <Link href={`/${shortName}:${address}/transactions`}>
            <a>Transactions</a>
          </Link>
        </li>
      </ul>

      {!error && <SafeList />}

      {loading ? 'Loading Safe info...' : error ? 'Error loading Safe' : ''}
      <button onClick={handleCreateTransaction}>Create Transaction</button>
    </div>
  )
}

export default Sidebar
