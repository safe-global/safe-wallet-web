import React from 'react'
import Badge, { type BadgeProps } from '@mui/material/Badge'

const UnreadBadge = ({ children, ...props }: Pick<BadgeProps, 'children' | 'invisible' | 'anchorOrigin'>) => (
  <Badge
    variant="dot"
    sx={{
      '.MuiBadge-badge': {
        backgroundColor: ({ palette }) => palette.primary.main,
      },
    }}
    {...props}
  >
    {children}
  </Badge>
)

export default UnreadBadge
