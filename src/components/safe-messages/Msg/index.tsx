import { TextField } from '@mui/material'
import { useMemo } from 'react'
import type { ReactElement } from 'react'
import type { SafeMessage } from '@safe-global/safe-gateway-typescript-sdk'

import css from './styles.module.css'

const MAX_ROWS = 10

const Msg = ({ message }: { message: SafeMessage['message'] }): ReactElement => {
  const isTextMessage = typeof message === 'string'

  const readableData = useMemo(() => {
    return isTextMessage ? message : JSON.stringify(message, null, 2)
  }, [isTextMessage, message])

  return (
    <TextField
      maxRows={MAX_ROWS}
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
