import type { ChangeEvent } from 'react'
import { Button } from '@mui/material'
import { addUndeployedSafe } from '@/features/counterfactual/store/undeployedSafeSlice'
import { isUndeployedSafe } from '@/features/counterfactual/utils'
import { useAppDispatch } from '@/store'
import { showNotification } from '@/store/notificationsSlice'
import css from './styles.module.css'

const LoadSafeFromBackup = () => {
  const dispatch = useAppDispatch()

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
    <Button component="label" variant="outlined" size="large" sx={{ mt: 2, mb: 1 }}>
      Recover your Safe Account
      <input type="file" className={css.fileInput} onChange={handleUpload} />
    </Button>
  )
}

export default LoadSafeFromBackup
