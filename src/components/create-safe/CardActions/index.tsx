import { CardActions } from '@mui/material'
import type { CardActionsProps } from '@mui/material'

const CreateSafeCardActions = (props: CardActionsProps) => {
  return (
    <CardActions
      sx={{ borderTop: ({ palette }) => `1px solid ${palette.border.light}`, pl: '52px', py: 3 }}
      {...props}
    />
  )
}

export default CreateSafeCardActions
