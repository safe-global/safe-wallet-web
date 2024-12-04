import { type ReactElement } from 'react'
import InputAdornment from '@mui/material/InputAdornment'
import Typography from '@mui/material/Typography'
import EthHashInfo from '@/components/common/EthHashInfo'
import css from './styles.module.css'

const AddressInputReadOnly = ({ address }: { address: string }): ReactElement => {
  return (
    <div className={css.input} data-testid="address-book-recipient">
      <InputAdornment position="start">
        <Typography
          variant="body2"
          component="div"
          sx={{
            width: 1,
          }}
        >
          <EthHashInfo address={address} shortAddress={false} copyAddress={false} />
        </Typography>
      </InputAdornment>
    </div>
  )
}

export default AddressInputReadOnly
