import { Paper, Typography, SvgIcon } from '@mui/material'
import type { PaperProps } from '@mui/material'
import type { AddressEx } from '@safe-global/safe-gateway-typescript-sdk'
import type { ReactElement } from 'react'

import PlusIcon from '@/public/images/common/plus.svg'
import EthHashInfo from '@/components/common/EthHashInfo'

import css from './styles.module.css'

export function OwnerList({
  title,
  owners,
  sx,
}: {
  owners: Array<AddressEx>
  title?: string
  sx?: PaperProps['sx']
}): ReactElement {
  return (
    <Paper className={css.container} sx={sx}>
      <Typography color="text.secondary" display="flex" alignItems="center">
        <SvgIcon component={PlusIcon} inheritViewBox fontSize="small" sx={{ mr: 1 }} />
        {title ?? `New owner${owners.length > 1 ? 's' : ''}`}
      </Typography>
      {owners.map((newOwner) => (
        <EthHashInfo
          key={newOwner.value}
          address={newOwner.value}
          name={newOwner.name}
          shortAddress={false}
          showCopyButton
          hasExplorer
          avatarSize={32}
        />
      ))}
    </Paper>
  )
}
