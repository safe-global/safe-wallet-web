import { TextField } from '@mui/material'
import type { ReactElement } from 'react'
import type { SafeMessage } from '@safe-global/safe-gateway-typescript-sdk'

import css from './styles.module.css'

const Msg = ({ message }: { message: SafeMessage['message'] }): ReactElement => {
  const isTextMessage = typeof message === 'string'

  const readableData = isTextMessage ? message : JSON.stringify(message, null, 2)

  return (
    <TextField
      rows={isTextMessage ? 2 : 16}
      multiline
      disabled
      fullWidth
      className={css.msg}
      inputProps={{
        value: readableData,
      }}
    />
  )
}

export default Msg
