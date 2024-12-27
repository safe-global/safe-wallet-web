import Identicon from '@/components/common/Identicon'
import type { Bundle } from '@/features/bundle/bundleSlice'
import { createBundleLink } from '@/features/bundle/utils'
import css from '@/features/myAccounts/components/AccountItems/styles.module.css'
import { Box, Stack, Typography } from '@mui/material'
import ListItemButton from '@mui/material/ListItemButton'
import Link from 'next/link'

const BundleItem = ({ bundle }: { bundle: Bundle }) => {
  const MAX_NUM_VISIBLE_SAFES = 4
  const visibleSafes = bundle.safes.slice(0, MAX_NUM_VISIBLE_SAFES)

  return (
    <ListItemButton className={css.listItem}>
      <Link href={createBundleLink(bundle)} passHref>
        <Stack direction="row" px={2} py={2} alignItems="center">
          <Stack direction="row" flexWrap="wrap" maxWidth="52px" mr={2}>
            {visibleSafes.map((safe) => {
              return (
                <Box key={safe.address} ml="-2px" mt="-2px" sx={{ border: '2px solid white', borderRadius: '50%' }}>
                  <Identicon address={safe.address} size={24} />
                </Box>
              )
            })}
          </Stack>
          <Box>
            <Typography fontWeight="bold">{bundle.name}</Typography>
            <Typography>{bundle.safes.length} Safe Accounts</Typography>
          </Box>
        </Stack>
      </Link>
    </ListItemButton>
  )
}

export default BundleItem
