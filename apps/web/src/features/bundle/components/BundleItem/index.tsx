import CreateBundle from '@/features/bundle/components/CreateBundle'
import EditIcon from '@/public/images/common/edit.svg'
import { useAppDispatch } from '@/store'
import type { MouseEvent } from 'react'
import React, { useState } from 'react'
import Link from 'next/link'
import Identicon from '@/components/common/Identicon'
import { type Bundle, removeBundle } from '@/features/bundle/bundleSlice'
import { createBundleLink } from '@/features/bundle/utils'
import css from '@/features/myAccounts/components/AccountItems/styles.module.css'
import DeleteIcon from '@/public/images/common/delete.svg'
import { Box, IconButton, Stack, SvgIcon, Typography } from '@mui/material'
import ListItemButton from '@mui/material/ListItemButton'

const BundleItem = ({ bundle }: { bundle: Bundle }) => {
  const [open, setOpen] = useState(false)
  const dispatch = useAppDispatch()
  const MAX_NUM_VISIBLE_SAFES = 4
  const visibleSafes = bundle.safes.slice(0, MAX_NUM_VISIBLE_SAFES)

  const deleteBundle = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    dispatch(removeBundle(bundle))
  }

  const editBundle = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    setOpen(true)
  }

  return (
    <ListItemButton className={css.listItem} disableRipple>
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

          <IconButton onClick={editBundle} sx={{ ml: 'auto' }}>
            <SvgIcon component={EditIcon} inheritViewBox fontSize="small" />
          </IconButton>

          <IconButton onClick={deleteBundle} title="Remove bundle">
            <SvgIcon component={DeleteIcon} inheritViewBox fontSize="small" />
          </IconButton>
        </Stack>
      </Link>
      <CreateBundle open={open} setOpen={setOpen} bundle={bundle} />
    </ListItemButton>
  )
}

export default BundleItem
