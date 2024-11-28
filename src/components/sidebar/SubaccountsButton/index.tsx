import { Tooltip, IconButton, SvgIcon, Badge, Typography } from '@mui/material'
import { useState } from 'react'
import type { ReactElement } from 'react'

import SubaccountsIcon from '@/public/images/sidebar/subaccounts-icon.svg'
import { SubaccountsPopover } from '@/components/sidebar/SubaccountsPopover'
import { useGetSafesByOwnerQuery } from '@/store/slices'
import { skipToken } from '@reduxjs/toolkit/query'

import headerCss from '@/components/sidebar/SidebarHeader/styles.module.css'
import css from './styles.module.css'

export function SubaccountsButton({ chainId, safeAddress }: { chainId: string; safeAddress: string }): ReactElement {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)
  const { data } = useGetSafesByOwnerQuery(safeAddress ? { chainId, ownerAddress: safeAddress } : skipToken)
  const subaccounts = data?.safes ?? []

  const onClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }
  const onClose = () => {
    setAnchorEl(null)
  }

  return (
    <>
      <Tooltip title="Subaccounts" placement="top">
        <Badge invisible={subaccounts.length > 0} variant="dot" className={css.badge}>
          <IconButton
            className={headerCss.iconButton}
            sx={{
              width: 'auto !important',
              minWidth: '32px !important',
              backgroundColor: anchorEl ? '#f2fecd !important' : undefined,
            }}
            onClick={onClick}
          >
            <SvgIcon component={SubaccountsIcon} inheritViewBox color="primary" fontSize="small" />
            {subaccounts.length > 0 && (
              <Typography component="span" variant="caption" className={css.count}>
                {subaccounts.length}
              </Typography>
            )}
          </IconButton>
        </Badge>
      </Tooltip>
      <SubaccountsPopover anchorEl={anchorEl} onClose={onClose} subaccounts={subaccounts} />
    </>
  )
}
