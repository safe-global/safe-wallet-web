import { Link } from '@mui/material'
import { useState } from 'react'
import type { ReactElement } from 'react'
import type { SafeMessage } from '@safe-global/safe-gateway-typescript-sdk'

import css from './styles.module.css'
import classNames from 'classnames'

const Msg = ({
  message,
  showInitially = false,
}: {
  message: SafeMessage['message']
  showInitially?: boolean
}): ReactElement => {
  const [showMsg, setShowMsg] = useState(showInitially)

  const handleToggleMsg = () => {
    setShowMsg((prev) => !prev)
  }

  if (typeof message === 'string') {
    return <>{message}</>
  }

  return (
    <>
      <div>
        <pre>
          <code className={classNames({ [css.truncated]: !showMsg })}>{JSON.stringify(message, null, 2)}</code>
        </pre>
        <Link component="button" onClick={handleToggleMsg} fontSize="medium" className={css.toggle}>
          {showMsg ? 'Hide' : 'Show all'}
        </Link>
      </div>
    </>
  )
}

export default Msg
