import { Button } from '@mui/material'
import Link from 'next/link'
import { AppRoutes } from '@/config/routes'
import { useCurrentChain } from '@/hooks/useChains'

const CreateButton = () => {
  const currentChain = useCurrentChain()

  return (
    <Link href={{ pathname: AppRoutes.newSafe.create, query: { chain: currentChain?.shortName } }}>
      <Button disableElevation size="small" variant="contained">
        Create account
      </Button>
    </Link>
  )
}

export default CreateButton
