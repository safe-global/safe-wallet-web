import type { ReactElement, ReactNode } from 'react'
import { Button, Typography } from '@mui/material'
import useSafeInfo from '@/hooks/useSafeInfo'
import css from './styles.module.css'

const SafeLoadingError = ({ children }: { children: ReactNode }): ReactElement => {
  const { error } = useSafeInfo()

  if (!error) return <>{children}</>

  return (
    <div className={css.container}>
      <img src="/images/error.png" alt="Error loading Safe" />

      <Typography variant="h3" m={3}>
        This Safe couldn&apos;t be loaded
      </Typography>

      <Button variant="contained" color="primary" size="large" href="/">
        Go to the main page
      </Button>
    </div>
  )
}

export default SafeLoadingError
