import { type ReactNode, useState, type ReactElement, useId } from 'react'
import { IconButton, InputAdornment, InputLabel, OutlinedInput, SvgIcon, Typography } from '@mui/material'
import EthHashInfo from '@/components/common/EthHashInfo'
import SaveAddressIcon from '@/public/images/common/save-address.svg'
import css from './styles.module.css'
import EntryDialog from '@/components/address-book/EntryDialog'
import useAddressBook from '@/hooks/useAddressBook'

const AddressInputReadOnly = ({
  label,
  address,
  error,
}: {
  label: ReactNode
  address: string
  error?: boolean
}): ReactElement => {
  const addressBook = useAddressBook()
  const [open, setOpen] = useState(false)

  const id = useId()

  return (
    <>
      <div className={css.wrapper}>
        <InputLabel shrink error={error} htmlFor={id}>
          {label}
        </InputLabel>
        <OutlinedInput
          id={id}
          className={css.input}
          error={error}
          startAdornment={
            <InputAdornment position="start">
              <Typography variant="body2" component="div">
                <EthHashInfo address={address} shortAddress={false} copyAddress={false} />
              </Typography>
            </InputAdornment>
          }
          endAdornment={
            !addressBook[address] ? (
              <InputAdornment position="end">
                <IconButton onClick={() => setOpen(true)}>
                  <SvgIcon component={SaveAddressIcon} inheritViewBox fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : null
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
