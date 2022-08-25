import { ReactElement } from 'react'
import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material'
import { useAppDispatch, useAppSelector } from '@/store'
import { selectCurrency, setCurrency } from '@/store/settingsSlice'
import useCurrencies from './useCurrencies'
import css from './styles.module.css'
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
    <div className={css.container}>
      <FormControl fullWidth size="small">
        <InputLabel id="currency-label">Currency</InputLabel>

        <Select
          labelId="currency-label"
          id="currency"
          value={currency.toUpperCase()}
          label="Currency"
          onChange={handleChange}
          onOpen={() => handleTrack('Open')}
          onClose={() => handleTrack('Close')}
        >
          {fiatCurrencies.map((item) => (
            <MenuItem key={item} value={item}>
              {item.toUpperCase()}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  )
}

export default CurrencySelect
