import { type ReactNode, useState, type ReactElement, useId } from 'react'
import { InputAdornment, InputLabel, OutlinedInput, Typography } from '@mui/material'
import EthHashInfo from '@/components/common/EthHashInfo'
import css from './styles.module.css'
import EntryDialog from '@/components/address-book/EntryDialog'

const AddressInputReadOnly = ({
  label,
  address,
  error,
}: {
  label: ReactNode
  address: string
  error?: boolean
}): ReactElement => {
  const [open, setOpen] = useState(false)

  const id = useId()

  return (
    <>
      <div className={css.wrapper} title={address}>
        <InputLabel shrink error={error} htmlFor={id}>
          {label}
        </InputLabel>
        <OutlinedInput
          id={id}
          className={css.input}
          error={error}
          startAdornment={
            <InputAdornment position="start" className={css.value}>
              <Typography variant="body2" component="div" width={1}>
                <EthHashInfo address={address} shortAddress={false} copyAddress={false} />
              </Typography>
            </InputAdornment>
          }
          label={label}
          readOnly
        />
      </div>
      {open && <EntryDialog handleClose={() => setOpen(false)} defaultValues={{ name: '', address }} />}
    </>
  )
}

export default AddressInputReadOnly
