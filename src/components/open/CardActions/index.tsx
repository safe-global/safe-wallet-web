import { CardActions } from '@mui/material'
import type { CardActionsProps } from '@mui/material'

import css from './styles.module.css'

const CreateSafeCardActions = (props: CardActionsProps) => {
  return <CardActions className={css.actions} {...props} />
}

export default CreateSafeCardActions
