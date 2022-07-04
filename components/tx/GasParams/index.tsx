import { ReactElement, SyntheticEvent } from 'react'
import { Accordion, AccordionDetails, AccordionSummary, Skeleton, Typography } from '@mui/material'
import css from './styles.module.css'
import { useCurrentChain } from '@/hooks/useChains'
import { safeFormatUnits } from '@/utils/formatters'
import { AdvancedParameters } from '../AdvancedParamsForm'

type GasParamsProps = Partial<AdvancedParameters> & {
  isLoading: boolean
  isExecution: boolean
  onEdit: () => void
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

const GasParams = ({
  nonce,
  gasLimit,
  maxFeePerGas,
  maxPriorityFeePerGas,
  isLoading,
  isExecution,
  onEdit,
}: GasParamsProps): ReactElement => {
  const chain = useCurrentChain()

  // Total gas cost
  const totalFee =
    gasLimit && maxFeePerGas && maxPriorityFeePerGas
      ? safeFormatUnits(maxFeePerGas.add(maxPriorityFeePerGas).mul(gasLimit), chain?.nativeCurrency.decimals)
      : '> 0.001'

  // Individual gas params
  const gasLimitString = gasLimit?.toString() || ''
  const maxFeePerGasGwei = maxFeePerGas ? safeFormatUnits(maxFeePerGas) : ''
  const maxPrioGasGwei = maxPriorityFeePerGas ? safeFormatUnits(maxPriorityFeePerGas) : ''

  const onEditClick = (e: SyntheticEvent) => {
    e.preventDefault()
    !isLoading && onEdit()
  }

  return (
    <div className={css.container}>
      <Accordion elevation={0}>
        <AccordionSummary>
          {isExecution ? (
            <Typography>
              Estimated fee{' '}
              {isLoading ? (
                <Skeleton variant="text" sx={{ display: 'inline-block', minWidth: '7em' }} />
              ) : (
                `${totalFee} ${chain?.nativeCurrency.symbol}`
              )}
            </Typography>
          ) : (
            <Typography>Off-chain signature</Typography>
          )}
        </AccordionSummary>

        <AccordionDetails>
          <GasDetail isLoading={nonce == null} name="Nonce" value={(nonce || '').toString()} />

          {isExecution && (
            <>
              <GasDetail isLoading={isLoading} name="Gas limit" value={gasLimitString} />

              <GasDetail isLoading={isLoading} name="Max priority fee (Gwei)" value={maxPrioGasGwei} />

              <GasDetail isLoading={isLoading} name="Max fee (Gwei)" value={maxFeePerGasGwei} />
            </>
          )}

          <Typography
            className={css.buttonLink}
            onClick={onEditClick}
            sx={({ palette }) => ({ color: palette.primary.main })}
            marginTop={1}
          >
            Edit
          </Typography>
        </AccordionDetails>
      </Accordion>
    </div>
  )
}

export default GasParams
