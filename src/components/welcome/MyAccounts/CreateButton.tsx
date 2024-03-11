import { Button } from '@mui/material'
import Link from 'next/link'
import { AppRoutes } from '@/config/routes'

const buttonSx = { width: ['100%', 'auto'], height: '37.5px' }

const CreateButton = ({ compact }: { compact: boolean }) => {
  return (
    <Link href={AppRoutes.newSafe.create} passHref legacyBehavior>
      <Button
        data-testid="create-safe-btn"
        disableElevation
        size="small"
        variant="contained"
        sx={buttonSx}
        component="a"
      >
        {compact ? 'Create' : 'Create account'}
      </Button>
    </Link>
  )
}

export default CreateButton
