import List, { type ListProps } from '@mui/material/List'
import ListItemButton, { type ListItemButtonProps } from '@mui/material/ListItemButton'
import ListItemIcon, { type ListItemIconProps } from '@mui/material/ListItemIcon'
import ListItemText, { type ListItemTextProps } from '@mui/material/ListItemText'
import Link, { type LinkProps } from 'next/link'
import type { ReactElement } from 'react'

import css from './styles.module.css'

export const SidebarList = ({ children, ...rest }: Omit<ListProps, 'className'>): ReactElement => (
  <List component="nav" className={css.list} {...rest}>
    {children}
  </List>
)

export const SidebarListItemButton = ({
  href,
  children,
  ...rest
}: Omit<ListItemButtonProps, 'sx'> & { href: LinkProps['href'] }): ReactElement => (
  <Link href={href} passHref>
    <ListItemButton
      sx={({ palette }) => ({
        borderRadius: '6px',
        '&.MuiListItemButton-root:hover, &.MuiListItemButton-root.Mui-selected': {
          // @ts-expect-error type '200' can't be used to index type 'PaletteColor'
          backgroundColor: `${palette.primary[200]} !important`,
          // TODO:
          img: {
            // @ts-expect-error type '400' can't be used to index type 'PaletteColor'
            fill: palette.primary[400],
          },
        },
      })}
      {...rest}
    >
      {children}
    </ListItemButton>
  </Link>
)

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
  <ListItemText primaryTypographyProps={{ variant: 'subtitle2', fontWeight: bold ? 700 : undefined }} {...rest}>
    {children}
  </ListItemText>
)
