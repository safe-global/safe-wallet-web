import type { ReactElement, ReactNode } from 'react'
import { Typography } from '@mui/material'
import css from './styles.module.css'

type PagePlaceholderProps = {
  imageUrl: string
  text: string
  children?: ReactNode
}

const PagePlaceholder = ({ imageUrl, text, children }: PagePlaceholderProps): ReactElement => {
  return (
    <div className={css.container}>
      <img src={imageUrl} alt="A placeholder image for an empty page" />

      <Typography variant="body1" color="primary.light">
        {text}
      </Typography>

      {children}
    </div>
  )
}

export default PagePlaceholder
