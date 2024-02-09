import { Button } from '@mui/material'
import Link from 'next/link'
import { AppRoutes } from '@/config/routes'
import { useCurrentChain } from '@/hooks/useChains'

const CreateButton = () => {
  const currentChain = useCurrentChain()

  return (
    <Link
      href={{ pathname: AppRoutes.newSafe.create, query: { chain: currentChain?.shortName } }}
      passHref
      legacyBehavior
    >
      <Button disableElevation size="small" variant="contained" sx={{ width: ['100%', 'auto'] }} component="a">
        Create account
      </Button>
    </Link>
  )
}

export default CreateButton
