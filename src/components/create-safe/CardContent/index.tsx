import { CardContent } from '@mui/material'
import type { CardContentProps } from '@mui/material'

import css from './styles.module.css'

const CreateSafeCardContent = (props: CardContentProps) => {
  return <CardContent className={css.content} {...props} />
}

export default CreateSafeCardContent
