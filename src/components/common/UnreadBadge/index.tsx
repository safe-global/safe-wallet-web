import React from 'react'
import Badge, { type BadgeProps } from '@mui/material/Badge'

const UnreadBadge = ({ children, ...props }: Pick<BadgeProps, 'children' | 'invisible' | 'anchorOrigin'>) => (
  <Badge variant="dot" color="success" {...props}>
    {children}
  </Badge>
)

export default UnreadBadge
