import React, { forwardRef } from 'react'
import NextLink, { type LinkProps as NextLinkProps } from 'next/link'
import { Tab, Tabs, Typography, type TabProps } from '@mui/material'
import { useRouter } from 'next/router'
import type { NavItem } from '@/components/sidebar/SidebarNavigation/config'
import css from './styles.module.css'

type Props = TabProps & NextLinkProps

// This is needed in order for the tabs to work properly with Next Link e.g. tabbing with the keyboard
// Based on https://github.com/mui/material-ui/blob/master/examples/nextjs-with-typescript/src/Link.tsx
const NextLinkComposed = forwardRef<HTMLAnchorElement, Props>(function NextComposedLink(props: Props, ref) {
  const { href, as, replace, scroll, shallow, prefetch, legacyBehavior = true, locale, ...other } = props

  return (
    <NextLink
      href={href}
      prefetch={prefetch}
      as={as}
      replace={replace}
      scroll={scroll}
      shallow={shallow}
      passHref
      locale={locale}
      legacyBehavior={legacyBehavior}
    >
      {/* @ts-ignore */}
      <a ref={ref} {...other} />
    </NextLink>
  )
})

const NavTabs = ({ tabs }: { tabs: NavItem[] }) => {
  const router = useRouter()
  const activeTab = tabs.map((tab) => tab.href).indexOf(router.pathname)
  const query = router.query.safe ? { safe: router.query.safe } : undefined

  return (
    <Tabs value={activeTab} variant="scrollable" allowScrollButtonsMobile className={css.tabs}>
      {tabs.map((tab, idx) => (
        <Tab
          component={NextLinkComposed}
          key={tab.href}
          href={{ pathname: tab.href, query }}
          className={css.tab}
          label={
            <Typography
              variant="body2"
              fontWeight={700}
              color={activeTab === idx ? 'primary' : 'primary.light'}
              className={css.label}
            >
              {tab.label}
            </Typography>
          }
        />
      ))}
    </Tabs>
  )
}

export default NavTabs
