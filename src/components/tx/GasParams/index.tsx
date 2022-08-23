import { ReactElement, SyntheticEvent, useState } from 'react'
import { Accordion, AccordionDetails, AccordionSummary, Skeleton, Typography, Link, Grid } from '@mui/material'
import { useCurrentChain } from '@/hooks/useChains'
import { safeFormatUnits } from '@/utils/formatters'
import { type AdvancedParameters } from '../AdvancedParams/types'
import Track from '@/components/common/Track'
import { MODALS_EVENTS } from '@/services/analytics/events/modals'
import { trackEvent } from '@/services/analytics/analytics'

const GasDetail = ({ name, value, isLoading }: { name: string; value: string; isLoading: boolean }): ReactElement => {
  const valueSkeleton = <Skeleton variant="text" sx={{ minWidth: '5em' }} />
  return (
    <Grid container>
      <Grid item xs>
        {name}
      </Grid>
      <Grid item>{value || (isLoading ? valueSkeleton : '-')}</Grid>
    </Grid>
  )
}

type GasParamsProps = {
  params: AdvancedParameters
  isExecution: boolean
  onEdit: () => void
}

const GasParams = ({ params, isExecution, onEdit }: GasParamsProps): ReactElement => {
  const { nonce, userNonce, safeTxGas, gasLimit, maxFeePerGas, maxPriorityFeePerGas } = params
  const [isAccordionExpanded, setIsAccordionExpanded] = useState(false)

  const onChangeExpand = () => {
    setIsAccordionExpanded((prev) => !prev)
    trackEvent({ ...MODALS_EVENTS.ESTIMATION, label: isAccordionExpanded ? 'Close' : 'Open' })
  }

  const chain = useCurrentChain()

  const isLoading = !gasLimit || !maxFeePerGas || !maxPriorityFeePerGas

  // Total gas cost
  const totalFee = !isLoading
    ? safeFormatUnits(maxFeePerGas.add(maxPriorityFeePerGas).mul(gasLimit), chain?.nativeCurrency.decimals)
    : '> 0.001'

  // Individual gas params
  const gasLimitString = gasLimit?.toString() || ''
  const maxFeePerGasGwei = maxFeePerGas ? safeFormatUnits(maxFeePerGas) : ''
  const maxPrioGasGwei = maxPriorityFeePerGas ? safeFormatUnits(maxPriorityFeePerGas) : ''

  const onEditClick = (e: SyntheticEvent) => {
    e.preventDefault()
    onEdit()
  }

  return (
    <Accordion elevation={0} onChange={onChangeExpand}>
      <AccordionSummary>
        {isExecution ? (
          <Typography display="flex" alignItems="center" justifyContent="space-between" width={1}>
            <span>Estimated fee </span>
            {isLoading ? (
              <Skeleton variant="text" sx={{ display: 'inline-block', minWidth: '7em' }} />
            ) : (
              <span>
                {totalFee} {chain?.nativeCurrency.symbol}
              </span>
            )}
          </Typography>
        ) : (
          <Typography>
            Signing the transaction with nonce&nbsp;
            {nonce || <Skeleton variant="text" sx={{ display: 'inline-block', minWidth: '2em' }} />}
          </Typography>
        )}
      </AccordionSummary>

      <AccordionDetails>
        {nonce !== undefined && <GasDetail isLoading={false} name="Safe transaction nonce" value={nonce.toString()} />}

        {userNonce !== undefined && <GasDetail isLoading={false} name="Wallet nonce" value={userNonce.toString()} />}

        {!!safeTxGas && <GasDetail isLoading={false} name="safeTxGas" value={safeTxGas.toString()} />}

        {isExecution && (
          <>
            <GasDetail isLoading={isLoading} name="Gas limit" value={gasLimitString} />

            <GasDetail isLoading={isLoading} name="Max priority fee (Gwei)" value={maxPrioGasGwei} />

            <GasDetail isLoading={isLoading} name="Max fee (Gwei)" value={maxFeePerGasGwei} />
          </>
        )}

        {!isExecution || (isExecution && !isLoading) ? (
          <Track {...MODALS_EVENTS.EDIT_ESTIMATION}>
            <Link component="button" onClick={onEditClick} sx={{ mt: 2 }} fontSize="medium">
              Edit
            </Link>
          </Track>
        ) : (
          <Skeleton variant="text" sx={{ display: 'inline-block', minWidth: '2em', mt: 2 }} />
        )}
      </AccordionDetails>
    </Accordion>
  )
}

export default GasParams
