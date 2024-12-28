import { AppRoutes } from '@/config/routes'
import { selectAllBundles } from '@/features/bundle/bundleSlice'
import BundleItem from '@/features/bundle/components/BundleItem'
import { Box, Paper, Stack, Typography } from '@mui/material'
import css from '@/features/myAccounts/styles.module.css'
import Button from '@mui/material/Button'
import Link from 'next/link'
import { useSelector } from 'react-redux'
import CreateBundleButton from 'src/features/bundle/CreateBundleButton'

const MyBundles = () => {
  const bundles = useSelector(selectAllBundles)
  const bundlesArray = Object.values(bundles)

  return (
    <Box data-testid="sidebar-safe-container" className={css.container}>
      <Box className={css.myAccounts}>
        <Stack direction="row" className={css.header}>
          <Typography variant="h1" fontWeight={700}>
            My Bundles
          </Typography>

          <Box className={css.headerButtons}>
            <Link href={AppRoutes.welcome.accounts}>
              <Button disableElevation variant="outlined" size="small" sx={{ height: '36px', width: '100%', px: 2 }}>
                Accounts
              </Button>
            </Link>

            <CreateBundleButton />
          </Box>
        </Stack>

        <Paper className={css.safeList}>
          {bundlesArray.length > 0 ? (
            bundlesArray.map((bundle) => <BundleItem key={bundle.name} bundle={bundle} />)
          ) : (
            <Typography textAlign="center" py={2}>
              You don&apos;t have any bundles yet.
            </Typography>
          )}
        </Paper>
      </Box>
    </Box>
  )
}

export default MyBundles
