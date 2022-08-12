import { Typography } from '@mui/material'
import { SafeAppData } from '@gnosis.pm/safe-react-gateway-sdk'
import styles from './styles.module.css'
import { AddCustomAppCard } from '@/components/safe-apps/AddCustomAppCard'

type Props = {
  safeAppList: SafeAppData[]
  onCustomAppSave: (safeApp: SafeAppData) => void
}

const SafeAppsHeader = ({ safeAppList, onCustomAppSave }: Props) => {
  return (
    <div className={styles.header}>
      <Typography variant="h1">Safe Apps</Typography>
      <Typography variant="body1">Explore endless possibilities to manage your assets.</Typography>
      <AddCustomAppCard onSave={onCustomAppSave} safeAppList={safeAppList} />
    </div>
  )
}

export { SafeAppsHeader }
