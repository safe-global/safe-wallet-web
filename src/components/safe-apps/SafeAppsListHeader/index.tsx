import Typography from '@mui/material/Typography'

type SafeAppsListHeaderProps = {
  title: string
  amount?: number
}

const SafeAppsListHeader = ({ title, amount }: SafeAppsListHeaderProps) => {
  return (
    <Typography variant="body2" color="primary.light" fontWeight="bold" mt={3}>
      {title} ({amount || 0})
    </Typography>
  )
}

export default SafeAppsListHeader
