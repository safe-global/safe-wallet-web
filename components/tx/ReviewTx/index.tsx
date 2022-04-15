import { SafeTransaction } from '@gnosis.pm/safe-core-sdk-types'
import { Button, Typography } from '@mui/material'
import TokenAmount from 'components/common/TokenAmount'
import { ReactElement } from 'react'
import { createTransaction } from 'services/createTransaction'
import { toDecimals } from 'services/formatters'
import { useAppSelector } from 'store'
import { selectBalances } from 'store/balancesSlice'
import { SendAssetsFormData } from '../SendAssetsForm'
import css from './styles.module.css'

const ReviewTx = ({ data, onSubmit }: { data: unknown; onSubmit: (tx: SafeTransaction) => void }): ReactElement => {
  const txData: SendAssetsFormData = data as SendAssetsFormData
  const balances = useAppSelector(selectBalances)
  const token = balances.items.find((item) => item.tokenInfo.address === txData.tokenAddress)
  const value = token ? toDecimals(txData.amount, token?.tokenInfo.decimals) : '0'

  const onCreate = async () => {
    const tx = await createTransaction({
      to: txData.recepient,
      value,
    })

    onSubmit(tx)
  }

  return (
    <div className={css.container}>
      <Typography variant="h6">Review transaction</Typography>

      <div>Recepient: {txData.recepient}</div>

      <div>
        Send{' '}
        <TokenAmount
          value={value}
          decimals={token?.tokenInfo.decimals}
          tokenSymbol={token?.tokenInfo.symbol}
          logoUri={token?.tokenInfo.logoUri}
        />
      </div>

      <div className={css.submit}>
        <Button variant="contained" onClick={onCreate}>
          Create transaction
        </Button>
      </div>
    </div>
  )
}

export default ReviewTx
