import type { ReactElement, ReactNode } from 'react'
import { Button } from '@mui/material'
import useSafeInfo from '@/hooks/useSafeInfo'
import PagePlaceholder from '../PagePlaceholder'

const SafeLoadingError = ({ children }: { children: ReactNode }): ReactElement => {
  const { error } = useSafeInfo()

  if (!error) return <>{children}</>

  return (
    <PagePlaceholder imageUrl="/images/error.svg" text="This Safe couldn't be loaded">
      <Button variant="contained" color="primary" size="large" href="/">
        Go to the main page
      </Button>
    </PagePlaceholder>
  )
}

export default SafeLoadingError
