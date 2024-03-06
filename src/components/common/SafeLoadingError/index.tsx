import { AppRoutes } from '@/config/routes'
import useSafeInfo from '@/hooks/useSafeInfo'
import { Button } from '@mui/material'
import Link from 'next/link'
import type { ReactElement, ReactNode } from 'react'
import PagePlaceholder from '../PagePlaceholder'

const SafeLoadingError = ({ children }: { children: ReactNode }): ReactElement => {
  const { safeError } = useSafeInfo()

  if (!safeError) return <>{children}</>

  return (
    <PagePlaceholder
      img={<img src="/images/common/error.png" alt="A vault with a red icon in the bottom right corner" />}
      text="This Safe Account couldn't be loaded"
    >
      <Link href={AppRoutes.welcome.index} passHref legacyBehavior>
        <Button data-sid="15018" variant="contained" color="primary" size="large" sx={{ mt: 2 }}>
          Go to the main page
        </Button>
      </Link>
    </PagePlaceholder>
  )
}

export default SafeLoadingError
