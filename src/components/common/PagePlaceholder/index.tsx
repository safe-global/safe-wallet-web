import type { ReactElement, ReactNode } from 'react'
import { Typography } from '@mui/material'
import css from './styles.module.css'

type PagePlaceholderProps = {
  img: ReactNode
  text: ReactNode
  children?: ReactNode
}

const PagePlaceholder = ({ img, text, children }: PagePlaceholderProps): ReactElement => {
  return (
    <div className={css.container}>
      {img}

      {typeof text === 'string' ? (
        <Typography variant="body1" color="primary.light" mt={2}>
          {text}
        </Typography>
      ) : (
        text
      )}

      {children}
    </div>
  )
}

export default PagePlaceholder
