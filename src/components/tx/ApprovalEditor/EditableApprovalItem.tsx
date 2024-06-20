import { Box, Button, IconButton, Stack, SvgIcon } from '@mui/material'
import css from '@/components/tx/ApprovalEditor/styles.module.css'
import type { ApprovalInfo } from './hooks/useApprovalInfos'

import { ApprovalValueField } from './ApprovalValueField'
import Track from '@/components/common/Track'
import { MODALS_EVENTS } from '@/services/analytics'
import { useFormContext } from 'react-hook-form'
import { get } from 'lodash'
import { EditOutlined } from '@mui/icons-material'
import TokenIcon from '@/components/common/TokenIcon'
import { useState } from 'react'

const EditableApprovalItem = ({
  approval,
  name,
  onSave,
}: {
  approval: ApprovalInfo
  onSave: () => void
  name: string
}) => {
  const { formState, setFocus } = useFormContext()

  const { errors, dirtyFields } = formState

  const fieldErrors = get(errors, name)
  const isDirty = get(dirtyFields, name)

  const [readOnly, setReadOnly] = useState(true)

  const handleSave = () => {
    onSave()
    setReadOnly(true)
  }

  const handleEditMode = () => {
    setReadOnly(false)
    // We need to rerender such that select on focus triggers
    setTimeout(() => setFocus(name), 0)
  }

  return (
    <Stack
      direction="row"
      alignItems="center"
      gap={2}
      className={css.approvalField}
      onClick={readOnly ? handleEditMode : undefined}
    >
      <Box display="flex" flexDirection="row" alignItems="center" gap="4px">
        <TokenIcon size={32} logoUri={approval.tokenInfo?.logoUri} tokenSymbol={approval.tokenInfo?.symbol} />
      </Box>

      <ApprovalValueField name={name} tx={approval} readOnly={readOnly} />

      <Track {...MODALS_EVENTS.EDIT_APPROVALS} label={readOnly ? 'edit' : 'save'}>
        {readOnly ? (
          <IconButton color="border" onClick={handleEditMode} title="Edit">
            <SvgIcon fontSize="small" component={EditOutlined} inheritViewBox />
          </IconButton>
        ) : (
          <Button title="Save" variant="text" size="small" onClick={handleSave} disabled={!!fieldErrors || !isDirty}>
            Save
          </Button>
        )}
      </Track>
    </Stack>
  )
}

export default EditableApprovalItem
