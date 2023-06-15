import { type ReactElement } from 'react'
import { IconButton, InputAdornment, InputLabel, OutlinedInput, SvgIcon, Typography } from '@mui/material'
import EthHashInfo from '@/components/common/EthHashInfo'
import SaveAddressIcon from '@/public/images/common/save-address.svg'
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
              <EthHashInfo address={address} />
            </Typography>
          </InputAdornment>
        }
        endAdornment={
          <InputAdornment position="end">
            <IconButton
              onClick={(e) => {
                e.stopPropagation()
                console.log('TODO: implement save address')
              }}
            >
              <SvgIcon component={SaveAddressIcon} inheritViewBox fontSize="small" />
            </IconButton>
          </InputAdornment>
        }
        label={label}
      />
    </div>
  )
}

export default AddressInputReadOnly
