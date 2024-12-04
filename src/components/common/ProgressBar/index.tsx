import LinearProgress, { type LinearProgressProps } from '@mui/material/LinearProgress'

import css from './styles.module.css'

export const ProgressBar = (props: LinearProgressProps) => {
  return <LinearProgress className={css.progressBar} variant="determinate" color="secondary" {...props} />
}
