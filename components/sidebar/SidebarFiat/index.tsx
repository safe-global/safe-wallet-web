import { useMemo, type ReactElement } from 'react'

import useBalances from '@/services/useBalances'
import { Typography } from '@mui/material'
import { useAppSelector } from '@/store'
import { selectCurrency } from '@/store/sessionSlice'

const SidebarFiat = (): ReactElement => {
  const currency = useAppSelector(selectCurrency)
  const { balances } = useBalances()

  const { wholeNumber, decimal, decimals } = useMemo(() => {
    const STANDARD_DECIMAL = '.'

    // Intl.NumberFormat always returns the currency code or symbol so we must manually remove it
    const formatter = new Intl.NumberFormat([], { style: 'currency', currency })

    const parts = formatter.formatToParts(Number(balances.fiatTotal))
    const decimal = parts.find(({ type }) => type === 'decimal')?.value || STANDARD_DECIMAL

    const [wholeNumber, decimals] = parts
      .filter(({ type }) => type !== 'currency') // Remove currency symbol
      .map(({ value }) => value)
      .join('') // Concatenate all parts
      .trim()
      .split(decimal)

    return { wholeNumber, decimal, decimals }
  }, [currency, balances.fiatTotal])
  return (
    <>
      <Typography variant="subtitle1" display="inline">
        {wholeNumber}
      </Typography>
      <Typography variant="subtitle1" display="inline" sx={({ palette }) => ({ color: palette.secondaryBlack[300] })}>
        {
          // Some currencies do not have no decimals
          decimals ? `${decimal}${decimals}` : ''
        }{' '}
        {currency.toUpperCase()}
      </Typography>
    </>
  )
}

export default SidebarFiat
