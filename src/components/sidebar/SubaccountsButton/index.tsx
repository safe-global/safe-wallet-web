import { Tooltip, IconButton, SvgIcon } from '@mui/material'
import { useState } from 'react'
import type { ReactElement } from 'react'

import SubaccountsIcon from '@/public/images/sidebar/subaccounts-icon.svg'
import { SubaccountsPopover } from '@/components/sidebar/SubaccountsPopover'

import headerCss from '@/components/sidebar/SidebarHeader/styles.module.css'

export function SubaccountsButton({ chainId, safeAddress }: { chainId: string; safeAddress: string }): ReactElement {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)

  const onClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }
  const onClose = () => {
    setAnchorEl(null)
  }

  return (
    <>
      <Tooltip title="Subaccounts" placement="top">
        <IconButton
          className={headerCss.iconButton}
          sx={anchorEl && { backgroundColor: '#f2fecd !important' }}
          onClick={onClick}
        >
          <SvgIcon component={SubaccountsIcon} inheritViewBox color="primary" fontSize="small" />
        </IconButton>
      </Tooltip>
      <SubaccountsPopover anchorEl={anchorEl} onClose={onClose} chainId={chainId} safeAddress={safeAddress} />
    </>
  )
}
