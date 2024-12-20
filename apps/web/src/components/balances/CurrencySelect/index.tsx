import type { ReactElement } from 'react'
import type { SelectChangeEvent } from '@mui/material'
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material'
import { useAppDispatch, useAppSelector } from '@/store'
import { selectCurrency, setCurrency } from '@/store/settingsSlice'
import useCurrencies from './useCurrencies'
import { trackEvent, ASSETS_EVENTS } from '@/services/analytics'

const CurrencySelect = (): ReactElement => {
  const currency = useAppSelector(selectCurrency)
  const dispatch = useAppDispatch()
  const fiatCurrencies = useCurrencies() || [currency.toUpperCase()]

  const handleChange = (e: SelectChangeEvent<string>) => {
    const currency = e.target.value

    trackEvent({
      ...ASSETS_EVENTS.CHANGE_CURRENCY,
      label: currency.toUpperCase(),
    })

    dispatch(setCurrency(currency.toLowerCase()))
  }

  const handleTrack = (label: 'Open' | 'Close') => {
    trackEvent({
      ...ASSETS_EVENTS.CURRENCY_MENU,
      label,
    })
  }

  return (
    <FormControl size="small">
      <InputLabel id="currency-label">Currency</InputLabel>

      <Select
        data-testid="currency-selector"
        labelId="currency-label"
        id="currency"
        value={currency.toUpperCase()}
        label="Currency"
        onChange={handleChange}
        onOpen={() => handleTrack('Open')}
        onClose={() => handleTrack('Close')}
      >
        {fiatCurrencies.map((item) => (
          <MenuItem data-testid="currency-item" key={item} value={item} sx={{ overflow: 'hidden' }}>
            {item.toUpperCase()}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}

export default CurrencySelect
