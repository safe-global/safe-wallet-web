import { LinearProgress } from '@mui/material'
import type { LinearProgressProps } from '@mui/material'
import css from './styles.module.css'

const ProgressBar = (props: LinearProgressProps) => {
  return <LinearProgress className={css.progressBar} variant="determinate" color="secondary" {...props} />
}

export default ProgressBar
