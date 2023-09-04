import { LinearProgress } from '@mui/material'
import type { LinearProgressProps } from '@mui/material'

import css from './styles.module.css'

export const ProgressBar = (props: LinearProgressProps) => {
  return <LinearProgress className={css.progressBar} variant="determinate" color="secondary" {...props} />
}
