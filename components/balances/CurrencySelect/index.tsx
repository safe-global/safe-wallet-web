import { ReactElement } from 'react'
import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material'
import { useAppDispatch, useAppSelector } from '@/store'
import { selectCurrency, setCurrency } from '@/store/currencySlice'
import useCurriencies from './useCurrencies'
import css from './styles.module.css'

const CurrencySelect = (): ReactElement => {
  const currency = useAppSelector(selectCurrency)
  const dispatch = useAppDispatch()
  const fiatCurrencies = useCurriencies() || [currency.toUpperCase()]

  const handleChange = (e: SelectChangeEvent<string>) => {
    dispatch(setCurrency(e.target.value.toLowerCase()))
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
