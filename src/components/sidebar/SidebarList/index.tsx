import type { ReactElement } from 'react'
import List, { type ListProps } from '@mui/material/List'
import ListItemButton, { type ListItemButtonProps } from '@mui/material/ListItemButton'
import ListItemIcon, { type ListItemIconProps } from '@mui/material/ListItemIcon'
import ListItemText, { type ListItemTextProps } from '@mui/material/ListItemText'
import Link, { type LinkProps } from 'next/link'

import css from './styles.module.css'

export const SidebarList = ({ children, ...rest }: Omit<ListProps, 'className'>): ReactElement => (
  <List className={css.list} {...rest}>
    {children}
  </List>
)

export const SidebarListItemButton = ({
  href,
  children,
  ...rest
}: Omit<ListItemButtonProps, 'sx'> & { href?: LinkProps['href'] }): ReactElement => {
  const button = (
    <ListItemButton className={css.listItemButton} {...rest}>
      {children}
    </ListItemButton>
  )

  return href ? (
    <Link href={href} passHref>
      {button}
    </Link>
  ) : (
    button
  )
}

export const SidebarListItemIcon = ({ children, ...rest }: Omit<ListItemIconProps, 'className'>): ReactElement => (
  <ListItemIcon className={css.icon} {...rest}>
    {children}
  </ListItemIcon>
)

export const SidebarListItemText = ({
  children,
  bold = false,
  ...rest
}: ListItemTextProps & { bold?: boolean }): ReactElement => (
  <ListItemText primaryTypographyProps={{ variant: 'body2', fontWeight: bold ? 700 : undefined }} {...rest}>
    {children}
  </ListItemText>
)
