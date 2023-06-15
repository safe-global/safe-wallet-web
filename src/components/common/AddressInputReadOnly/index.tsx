import { type ReactElement } from 'react'
import { InputAdornment, InputLabel, OutlinedInput, Typography } from '@mui/material'
import EthHashInfo from '@/components/common/EthHashInfo'
import css from './styles.module.css'

const AddressInputReadOnly = ({ label, address }: { label: string; address: string }): ReactElement => {
  return (
    <div className={css.wrapper}>
      <InputLabel shrink>{label}</InputLabel>
      <OutlinedInput
        className={css.input}
        startAdornment={
          <InputAdornment position="start">
            <Typography variant="body2" component="div">
              <EthHashInfo address={address} shortAddress={false} />
            </Typography>
          </InputAdornment>
        }
        label={label}
        onClick={() => console.log('reset value')}
      />
    </div>
  )
}

export default AddressInputReadOnly
