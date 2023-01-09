import { Link } from '@mui/material'
import { useState } from 'react'
import type { ReactElement } from 'react'
import type { SafeMessage } from '@safe-global/safe-gateway-typescript-sdk'

import css from './styles.module.css'

const Msg = ({
  message,
  defaultExpanded = false,
}: {
  message: SafeMessage['message']
  defaultExpanded?: boolean
}): ReactElement => {
  const [showMsg, setShowMsg] = useState(defaultExpanded)

  const handleToggleMsg = () => {
    setShowMsg((prev) => !prev)
  }

  if (typeof message === 'string') {
    return <>{message}</>
  }

  return (
    <>
      <Link component="button" onClick={handleToggleMsg} fontSize="medium" className={css.toggle}>
        {showMsg ? 'Hide' : 'Show all'}
      </Link>
      <pre>
        <code className={!showMsg ? css.truncated : undefined}>{JSON.stringify(message, null, 2)}</code>
      </pre>
    </>
  )
}

export default Msg
