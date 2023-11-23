import { IconButton, SvgIcon, Tooltip } from '@mui/material'
import { useContext, useState } from 'react'
import type { ReactElement } from 'react'

import { TxModalContext } from '@/components/tx-flow'
import useIsSafeOwner from '@/hooks/useIsSafeOwner'
import DeleteIcon from '@/public/images/common/delete.svg'
import EditIcon from '@/public/images/common/edit.svg'
import CheckWallet from '@/components/common/CheckWallet'
import { ConfirmRemoveRecoveryModal } from './ConfirmRemoveRecoveryModal'
import { UpsertRecoveryFlow } from '@/components/tx-flow/flows/UpsertRecovery'
import type { RecoveryStateItem } from '@/components/recovery/RecoveryContext'

export function DelayModifierRow({ delayModifier }: { delayModifier: RecoveryStateItem }): ReactElement | null {
  const { setTxFlow } = useContext(TxModalContext)
  const isOwner = useIsSafeOwner()
  const [confirm, setConfirm] = useState(false)

  if (!isOwner) {
    return null
  }

  const onEdit = () => {
    setTxFlow(<UpsertRecoveryFlow delayModifier={delayModifier} />)
  }

  const onDelete = () => {
    setConfirm(true)
  }

  const onCloseConfirm = () => {
    setConfirm(false)
  }

  return (
    <>
      <CheckWallet>
        {(isOk) => (
          <>
            <Tooltip title={isOk ? 'Edit recovery setup' : undefined}>
              <span>
                <IconButton onClick={onEdit} size="small" disabled={!isOk}>
                  <SvgIcon component={EditIcon} inheritViewBox color="border" fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>

            <Tooltip title={isOk ? 'Disable recovery' : undefined}>
              <span>
                <IconButton onClick={onDelete} size="small" disabled={!isOk}>
                  <SvgIcon component={DeleteIcon} inheritViewBox color="error" fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </>
        )}
      </CheckWallet>

      <ConfirmRemoveRecoveryModal open={confirm} onClose={onCloseConfirm} delayModifier={delayModifier} />
    </>
  )
}
