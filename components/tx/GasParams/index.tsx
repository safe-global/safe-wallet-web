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

const GasDetail = ({ name, value, isLoading }: { name: string; value: string; isLoading: boolean }): ReactElement => {
  const valueSkeleton = <Skeleton variant="text" sx={{ minWidth: '5em' }} />

  return (
    <div className={css.details}>
      <div className={css.label}>{name}</div>
      <div className={css.value}>{value || (isLoading ? valueSkeleton : '-')}</div>
    </div>
  )
}

const GasParams = ({ gasLimit, maxFeePerGas, maxPriorityFeePerGas, isLoading }: GasParamsProps): ReactElement => {
  const chain = useCurrentChain()

  // Total gas cost
  const totalFee =
    gasLimit && maxFeePerGas && maxPriorityFeePerGas
      ? formatPrice(maxFeePerGas.add(maxPriorityFeePerGas).mul(gasLimit), chain?.nativeCurrency.decimals)
      : '> 0.001'

  // Individual gas params
  const gasLimitString = gasLimit?.toString() || ''
  const maxFeePerGasGwei = maxFeePerGas ? formatPrice(maxFeePerGas, 'gwei') : ''
  const maxPrioGasGwei = maxPriorityFeePerGas ? formatPrice(maxPriorityFeePerGas, 'gwei') : ''

  return (
    <div className={css.container}>
      <Accordion>
        <AccordionSummary>
          <Typography>
            Estimated fee{' '}
            {isLoading ? (
              <Skeleton variant="text" sx={{ display: 'inline-block', minWidth: '7em' }} />
            ) : (
              `${totalFee} ${chain?.nativeCurrency.symbol}`
            )}
          </Typography>
        </AccordionSummary>

        <AccordionDetails>
          <GasDetail isLoading={isLoading} name="Gas limit" value={gasLimitString} />

          <GasDetail isLoading={isLoading} name="Max priority fee (Gwei)" value={maxPrioGasGwei} />

          <GasDetail isLoading={isLoading} name="Max fee (Gwei)" value={maxFeePerGasGwei} />
        </AccordionDetails>
      </Accordion>
    </div>
  )
}

export default GasParams
