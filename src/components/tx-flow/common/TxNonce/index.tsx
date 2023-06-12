import { type ChangeEvent, useCallback, useContext } from 'react'
import { Skeleton, Typography } from '@mui/material'
import { SafeTxContext } from '../../SafeTxProvider'
import css from './styles.module.css'

const TxNonce = () => {
  const { nonce, setNonce, safeTx } = useContext(SafeTxContext)
  const isEditable = !safeTx || safeTx?.signatures.size === 0

  const onChange = useCallback(
    (e: ChangeEvent<HTMLElement>) => {
      const newNonce = Number(e.target.textContent)
      setNonce(newNonce)
    },
    [setNonce],
  )

  if (nonce === undefined) return <Skeleton variant="rounded" width={40} height={26} />

  return (
    <Typography variant="h4" fontWeight={700}>
      #
      <span className={css.input} contentEditable={isEditable} onBlur={onChange}>
        {nonce}
      </span>
    </Typography>
  )
}

export default TxNonce
