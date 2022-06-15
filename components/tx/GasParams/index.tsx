import { ReactElement } from 'react'
import { BigNumber, BigNumberish } from 'ethers'
import { Accordion, AccordionDetails, AccordionSummary, Skeleton, Typography } from '@mui/material'
import css from './styles.module.css'
import { formatUnits } from 'ethers/lib/utils'
import { useCurrentChain } from '@/services/useChains'

type GasParamsProps = {
  gasLimit?: number
  maxFeePerGas?: BigNumber
  maxPriorityFeePerGas?: BigNumber
  isLoading: boolean
}

const formatPrice = (value: BigNumberish, type?: string | number): string => {
  try {
    return formatUnits(value, type)
  } catch (err) {
    console.error('Error formatting price', err)
    return ''
  }
}

const GasParams = ({ gasLimit, maxFeePerGas, maxPriorityFeePerGas, isLoading }: GasParamsProps): ReactElement => {
  const chain = useCurrentChain()
  const totalFee =
    gasLimit && maxFeePerGas && maxPriorityFeePerGas
      ? formatPrice(maxFeePerGas.add(maxPriorityFeePerGas).mul(gasLimit), chain?.nativeCurrency.decimals)
      : '> 0.001'
  const maxFeePerGasGwei = maxFeePerGas ? formatPrice(maxFeePerGas, 'gwei') : ''
  const maxPrioGasGwei = maxPriorityFeePerGas ? formatPrice(maxPriorityFeePerGas, 'gwei') : ''

  const valueSkeleton = <Skeleton variant="text" sx={{ display: 'inline-block', minWidth: '5em' }} />

  return (
    <div className={css.container}>
      <Accordion>
        <AccordionSummary>
          <Typography>
            Estimated fee {isLoading ? valueSkeleton : `${totalFee} ${chain?.nativeCurrency.symbol}`}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <div className={css.details}>
            <div className={css.label}>Gas limit</div>
            <div className={css.value}>{gasLimit ? gasLimit.toString() : isLoading ? valueSkeleton : '-'}</div>
          </div>

          <div className={css.details}>
            <div className={css.label}>Max priority fee (Gwei)</div>
            <div className={css.value}>{maxPrioGasGwei || (isLoading ? valueSkeleton : '-')}</div>
          </div>

          <div className={css.details}>
            <div className={css.label}>Max fee (Gwei)</div>
            <div className={css.value}>{maxFeePerGasGwei || (isLoading ? valueSkeleton : '-')}</div>
          </div>
        </AccordionDetails>
      </Accordion>
    </div>
  )
}

export default GasParams
