import type { ReactElement, ReactNode } from 'react'
import { Typography } from '@mui/material'
import css from './styles.module.css'

type PagePlaceholderProps = {
  img: ReactNode
  text: string
  children?: ReactNode
}

const PagePlaceholder = ({ img, text, children }: PagePlaceholderProps): ReactElement => {
  return (
    <div className={css.container}>
      {img}

      <Typography variant="body1" color="primary.light">
        {text}
      </Typography>

      {children}
    </div>
  )
}

export default PagePlaceholder
