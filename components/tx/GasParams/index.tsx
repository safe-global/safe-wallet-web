import { ReactElement } from 'react'
import { BigNumber, BigNumberish } from 'ethers'
import { Accordion, AccordionDetails, AccordionSummary, Skeleton, Typography } from '@mui/material'
import css from './styles.module.css'
import { formatUnits } from 'ethers/lib/utils'
import { useCurrentChain } from '@/services/useChains'

type GasParamsProps = {
  nonce?: string
  gasLimit?: number
  maxFeePerGas?: BigNumber
  maxPriorityFeePerGas?: BigNumber
}

const formatPrice = (value: BigNumberish, type?: string | number): string => {
  try {
    return formatUnits(value, type)
  } catch (err) {
    console.error('Error formatting price', err)
    return ''
  }
}

const GasParams = ({ gasLimit, maxFeePerGas, maxPriorityFeePerGas }: GasParamsProps): ReactElement => {
  const chain = useCurrentChain()
  const totalFee =
    gasLimit && maxFeePerGas && maxPriorityFeePerGas
      ? formatPrice(maxFeePerGas.add(maxPriorityFeePerGas).mul(gasLimit), chain?.nativeCurrency.decimals)
      : ''
  const maxFeePerGasGwei = maxFeePerGas ? formatPrice(maxFeePerGas, 'gwei') : ''
  const maxPrioGasGwei = maxPriorityFeePerGas ? formatPrice(maxPriorityFeePerGas, 'gwei') : ''

  const valueSkeleton = <Skeleton variant="text" sx={{ display: 'inline-block', minWidth: '5em' }} />

  return (
    <Accordion>
      <AccordionSummary>
        <Typography>
          Estimated fee {totalFee ? `${totalFee} ${chain?.nativeCurrency.symbol}` : valueSkeleton}
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <div className={css.details}>
          <div className={css.label}>Gas limit</div>
          <div className={css.value}>{gasLimit?.toString() || valueSkeleton}</div>
        </div>

        <div className={css.details}>
          <div className={css.label}>Max priority fee (Gwei)</div>
          <div className={css.value}>{maxPrioGasGwei || valueSkeleton}</div>
        </div>

        <div className={css.details}>
          <div className={css.label}>Max fee (Gwei)</div>
          <div className={css.value}>{maxFeePerGasGwei || valueSkeleton}</div>
        </div>
      </AccordionDetails>
    </Accordion>
  )
}

export default GasParams
