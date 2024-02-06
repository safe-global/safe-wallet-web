import { AppRoutes } from '@/config/routes'
import { useRouter } from 'next/router'
import type { ChangeEvent } from 'react'
import { Link } from '@mui/material'
import { addUndeployedSafe } from '@/features/counterfactual/store/undeployedSafeSlice'
import { isUndeployedSafe } from '@/features/counterfactual/utils'
import { useAppDispatch } from '@/store'
import { showNotification } from '@/store/notificationsSlice'
import css from './styles.module.css'

const LoadSafeFromBackup = () => {
  const dispatch = useAppDispatch()
  const router = useRouter()

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
          router.push({ pathname: AppRoutes.home, query: { safe: address } })
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
    <Link href="#" sx={{ mt: 2, mb: 1 }}>
      <label style={{ cursor: 'pointer' }}>
        Recover Safe Account
        <input type="file" className={css.fileInput} onChange={handleUpload} />
      </label>
    </Link>
  )
}

export default LoadSafeFromBackup
