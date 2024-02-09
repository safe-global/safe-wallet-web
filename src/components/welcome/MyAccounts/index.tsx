import { useMemo, useState } from 'react'
import { Button, Box, Paper, Typography } from '@mui/material'
import madProps from '@/utils/mad-props'
import AccountItem from './AccountItem'
import CreateButton from './CreateButton'
import useAllSafes, { type SafeItems } from './useAllSafes'

type AccountsListProps = {
  safes: SafeItems
}

const DEFAULT_SHOWN = 5
const MAX_DEFAULT_SHOWN = 7

const AccountsList = ({ safes }: AccountsListProps) => {
  const [maxShown, setMaxShown] = useState<number>(DEFAULT_SHOWN)

  const shownSafes = useMemo(() => {
    if (safes.length <= MAX_DEFAULT_SHOWN) {
      return safes
    }
    return safes.slice(0, maxShown)
  }, [safes, maxShown])

  const onShowMore = () => {
    const pageSize = 100 // DEFAULT_SHOWN
    setMaxShown((prev) => prev + pageSize)
  }

  return (
    <Box display="flex" justifyContent="center">
      <Box width={600} m={2}>
        <Box display="flex" justifyContent="space-between" py={3}>
          <Typography variant="h1" fontWeight={700}>
            My Safe accounts
            <Typography component="span" color="text.secondary" fontSize="inherit" fontWeight="normal">
              {' '}
              ({safes.length})
            </Typography>
          </Typography>

          <CreateButton />
        </Box>

        <Paper sx={{ p: 3, pb: 2 }}>
          {shownSafes.map((item) => (
            <AccountItem {...item} key={item.chainId + item.address} />
          ))}

          {safes.length > shownSafes.length && (
            <Box display="flex" justifyContent="center">
              <Button onClick={onShowMore}>Show more</Button>
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  )
}

const MyAccounts = madProps(AccountsList, {
  safes: useAllSafes,
})

export default MyAccounts
