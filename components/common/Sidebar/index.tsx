import { ReactElement } from 'react'
import { SafeTransactionDataPartial } from '@gnosis.pm/safe-core-sdk-types'
import { Button } from '@mui/material'

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
import { getSafeSDK } from 'utils/web3'

const Sidebar = (): ReactElement => {
  const { address, chainId } = useSafeAddress()
  const { error, loading } = useAppSelector(selectSafeInfo)
  const shortName = Object.keys(chains).find((key) => chains[key] === chainId)

  const handleCreateTransaction = async () => {
    const safeSdk = getSafeSDK()
    // TODO: Get these values from a form
    const nonce = await safeSdk.getNonce()
    const transaction: SafeTransactionDataPartial = {
      nonce,
      to: address,
      value: '1',
      data: '0x',
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

      <Button onClick={handleCreateTransaction} variant="contained" sx={{ margin: '20px 0' }}>
        New Transaction
      </Button>

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
