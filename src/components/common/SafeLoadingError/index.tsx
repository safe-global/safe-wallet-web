import { addUndeployedSafe } from '@/features/counterfactual/store/undeployedSafeSlice'
import { isUndeployedSafe } from '@/features/counterfactual/utils'
import { useHasFeature } from '@/hooks/useChains'
import { useAppDispatch } from '@/store'
import { showNotification } from '@/store/notificationsSlice'
import { FEATURES } from '@/utils/chains'
import { type ReactElement, type ReactNode, type ChangeEvent } from 'react'
import { Button } from '@mui/material'
import useSafeInfo from '@/hooks/useSafeInfo'
import PagePlaceholder from '../PagePlaceholder'
import { AppRoutes } from '@/config/routes'
import Link from 'next/link'

import css from './styles.module.css'

const SafeLoadingError = ({ children }: { children: ReactNode }): ReactElement => {
  const { safeError } = useSafeInfo()
  const dispatch = useAppDispatch()
  const isCounterfactualEnabled = useHasFeature(FEATURES.COUNTERFACTUAL)

  if (!safeError) return <>{children}</>

  const handleUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const file = e.target.files[0]
      const reader = new FileReader()
      reader.onload = (event) => {
        if (!event.target) {
          return
        }
        if (typeof event.target.result !== 'string') {
          return
        }

        const parsedData = JSON.parse(event.target.result)
        if (isUndeployedSafe(parsedData)) {
          const chainId = parsedData.chainId
          const address = parsedData.safeAddress
          const safeProps = parsedData.safeProps

          dispatch(addUndeployedSafe({ chainId, address, safeProps }))
        } else {
          dispatch(
            showNotification({
              variant: 'error',
              groupKey: 'safe-import-error',
              message: 'Could not recover safe account',
            }),
          )
        }
      }
      reader.readAsText(file)
    }
  }

  return (
    <PagePlaceholder
      img={<img src="/images/common/error.png" alt="A vault with a red icon in the bottom right corner" />}
      text="This Safe Account couldn't be loaded"
    >
      {isCounterfactualEnabled && (
        <>
          <Button component="label" variant="outlined" size="large" sx={{ mt: 2, mb: 1 }}>
            Recover your Safe Account
            <input type="file" className={css.fileInput} onChange={handleUpload} />
          </Button>{' '}
          or
        </>
      )}
      <Link href={AppRoutes.welcome.index} passHref legacyBehavior>
        <Button variant="contained" color="primary" size="large" sx={{ mt: 2 }}>
          Go to the main page
        </Button>
      </Link>
    </PagePlaceholder>
  )
}

export default SafeLoadingError
