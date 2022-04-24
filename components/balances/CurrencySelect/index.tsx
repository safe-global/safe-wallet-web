import { ReactElement } from 'react'
import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material'

import { useAppDispatch } from '@/store'
import { setCurrency } from '@/store/currencySlice'
import useCurriencies from '@/services/useCurrencies'
import css from './styles.module.css'

const CurrencySelect = (): ReactElement => {
  const dispatch = useAppDispatch()
  const { currencies, selectedCurrency } = useCurriencies()

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
          value={selectedCurrency.toUpperCase()}
          label="Currency"
          onChange={handleChange}
        >
          {currencies.map((item) => (
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
