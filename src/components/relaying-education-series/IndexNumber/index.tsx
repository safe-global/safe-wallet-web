import { Typography } from '@mui/material'
import css from './styles.module.css'

const IndexNumber = ({ value }: { value: number }) => {
  return (
    <Typography className={css.step}>
      {value.toLocaleString('en-US', {
        minimumIntegerDigits: 2,
        useGrouping: false,
      })}
    </Typography>
  )
}

export default IndexNumber
