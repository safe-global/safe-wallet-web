import { ReactElement } from 'react'
import { Accordion, AccordionDetails, AccordionSummary, Skeleton, Typography } from '@mui/material'
import css from './styles.module.css'
import { formatUnits } from 'ethers/lib/utils'
import { useCurrentChain } from '@/services/useChains'

type GasParamsProps = {
  gasLimit?: string
  gasPrice?: string
}

const formatPrice = (value: string | number, type?: string | number): string => {
  try {
    return formatUnits(value, type)
  } catch (err) {
    return ''
  }
}

const GasParams = ({ gasLimit, gasPrice }: GasParamsProps): ReactElement => {
  const chain = useCurrentChain()
  const totalFee =
    gasLimit && gasPrice ? formatPrice(Number(gasLimit) * Number(gasPrice), chain?.nativeCurrency.decimals) : ''
  const gasPriceGwei = gasPrice ? formatPrice(gasPrice, 'gwei') : ''

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
          <div className={css.value}>{gasLimit || valueSkeleton}</div>
        </div>

        <div className={css.details}>
          <div className={css.label}>Gas price</div>
          <div className={css.value}>{gasPriceGwei || valueSkeleton}</div>
        </div>
      </AccordionDetails>
    </Accordion>
  )
}

export default GasParams
