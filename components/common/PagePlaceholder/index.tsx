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
      <img src={imageUrl} alt="background" />

      <Typography variant="h3" m={3}>
        {text}
      </Typography>

      {children}
    </div>
  )
}

export default PagePlaceholder
