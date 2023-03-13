import type { ReactElement } from 'react'
import type { PermissionRequest } from '@safe-global/safe-apps-sdk/dist/src/types/permissions'
import { Button, Dialog, DialogActions, DialogContent, Divider, Typography } from '@mui/material'

import { ModalDialogTitle } from '@/components/common/ModalDialog'
import { getSafePermissionDisplayValues } from '@/hooks/safe-apps/permissions'

interface PermissionsPromptProps {
  origin: string
  isOpen: boolean
  requestId: string
  permissions: PermissionRequest[]
  onReject: (requestId?: string) => void
  onAccept: (origin: string, requestId: string) => void
}

const PermissionsPrompt = ({
  origin,
  isOpen,
  requestId,
  permissions,
  onReject,
  onAccept,
}: PermissionsPromptProps): ReactElement => {
  return (
    <Dialog open={isOpen}>
      <ModalDialogTitle onClose={() => onReject()}>
        <Typography variant="body1" fontWeight={700}>
          Permissions Request
        </Typography>
      </ModalDialogTitle>
      <Divider />
      <DialogContent>
        <Typography>
          <b>{origin}</b> is requesting permissions for:
        </Typography>
        <ul>
          {permissions.map((permission, index) => (
            <li key={index}>
              <Typography>{getSafePermissionDisplayValues(Object.keys(permission)[0]).description}</Typography>
            </li>
          ))}
        </ul>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', my: 3 }}>
        <Button
          variant="contained"
          color="error"
          size="small"
          onClick={() => onReject(requestId)}
          sx={{ minWidth: '130px' }}
        >
          Reject
        </Button>
        <Button variant="contained" size="small" onClick={() => onAccept(origin, requestId)} sx={{ minWidth: '130px' }}>
          Accept
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default PermissionsPrompt
