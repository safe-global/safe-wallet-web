import CheckWallet from '@/components/common/CheckWallet'
import Track from '@/components/common/Track'
import UpsertProposer from '@/features/proposers/components/UpsertProposer'
import EditIcon from '@/public/images/common/edit.svg'
import { SETTINGS_EVENTS } from '@/services/analytics'
import { IconButton, SvgIcon, Tooltip } from '@mui/material'
import type { Delegate } from '@safe-global/safe-gateway-typescript-sdk/dist/types/delegates'
import React, { useState } from 'react'

const EditProposerDialog = ({ proposer }: { proposer: Delegate }) => {
  const [open, setOpen] = useState<boolean>(false)

  return (
    <>
      <CheckWallet allowProposer={false}>
        {(isOk) => (
          <Track {...SETTINGS_EVENTS.PROPOSERS.EDIT_PROPOSER}>
            <Tooltip title="Edit proposer">
              <span>
                <IconButton onClick={() => setOpen(true)} size="small" disabled={!isOk}>
                  <SvgIcon component={EditIcon} inheritViewBox color="border" fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Track>
        )}
      </CheckWallet>

      {open && (
        <UpsertProposer
          onClose={() => setOpen(false)}
          onSuccess={() => setOpen(false)}
          address={proposer.delegate}
          name={proposer.label}
        />
      )}
    </>
  )
}

export default EditProposerDialog
