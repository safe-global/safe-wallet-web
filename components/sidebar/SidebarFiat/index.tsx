import React, { useMemo, type ReactElement } from 'react'
import Box from '@mui/material/Box'

import useBalances from '@/hooks/useBalances'
import { useAppSelector } from '@/store'
import { selectCurrency } from '@/store/sessionSlice'

const SidebarFiat = (): ReactElement => {
  const currency = useAppSelector(selectCurrency)
  const { balances } = useBalances()

  // TODO: Extract when implementing formatter functions
  const { wholeNumber, decimalSeparator, decimals } = useMemo(() => {
    // Intl.NumberFormat always returns the currency code or symbol so we must manually remove it
    const formatter = new Intl.NumberFormat([], { style: 'currency', currency })

    const parts = formatter.formatToParts(Number(balances.fiatTotal))

    const wholeNumber = parts.find(({ type }) => type === 'integer')?.value || 0
    const decimalSeparator = parts.find(({ type }) => type === 'decimal')?.value || ''
    const decimals = parts.find(({ type }) => type === 'fraction')?.value || ''

    return { wholeNumber, decimalSeparator, decimals }
  }, [currency, balances.fiatTotal])

  return (
    <>
      {wholeNumber}
      <Box display="inline" sx={({ palette }) => ({ color: palette.secondaryBlack[300] })}>
        {
          // Some currencies don't have decimals
          decimalSeparator && decimals ? `${decimalSeparator}${decimals}` : ''
        }{' '}
        {currency.toUpperCase()}
      </Box>
    </>
  )
}

export default React.memo(SidebarFiat)
