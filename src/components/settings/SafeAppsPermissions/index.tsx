import { useSafeApps } from '@/hooks/safe-apps/useSafeApps'
import {
  BROWSER_PERMISSIONS_TEXTS,
  SAFE_PERMISSIONS_TEXTS,
  useBrowserPermissions,
  useSafePermissions,
} from '@/hooks/safe-apps/permissions'
import { ReactElement, useCallback, useMemo } from 'react'
import { AllowedFeatures, PermissionStatus } from '@/components/safe-apps/types'
import { SafeAppData } from '@gnosis.pm/safe-react-gateway-sdk'
import { Grid, Link, Paper, Typography } from '@mui/material'
import PermissionsCheckbox from '@/components/safe-apps/PermissionCheckbox'
import DeleteIcon from '@mui/icons-material/DeleteOutlined'

const SafeAppsPermissions = (): ReactElement => {
  const { allSafeApps } = useSafeApps()
  const {
    permissions: safePermissions,
    updatePermission: updateSafePermission,
    removePermissions: removeSafePermissions,
    isUserRestricted,
  } = useSafePermissions()
  const {
    permissions: browserPermissions,
    updatePermission: updateBrowserPermission,
    removePermissions: removeBrowserPermissions,
  } = useBrowserPermissions()
  const domains = useMemo(() => {
    const mergedPermissionsSet = new Set(Object.keys(browserPermissions).concat(Object.keys(safePermissions)))

    return Array.from(mergedPermissionsSet)
  }, [safePermissions, browserPermissions])

  const handleSafePermissionsChange = (origin: string, capability: string, checked: boolean) =>
    updateSafePermission(origin, [{ capability, selected: checked }])

  const handleBrowserPermissionsChange = (origin: string, feature: AllowedFeatures, checked: boolean) =>
    updateBrowserPermission(origin, [{ feature, selected: checked }])

  const updateAllPermissions = useCallback(
    (origin: string, selected: boolean) => {
      if (safePermissions[origin]?.length)
        updateSafePermission(
          origin,
          safePermissions[origin].map(({ parentCapability }) => ({ capability: parentCapability, selected })),
        )

      if (browserPermissions[origin]?.length)
        updateBrowserPermission(
          origin,
          browserPermissions[origin].map(({ feature }) => ({ feature, selected })),
        )
    },
    [browserPermissions, safePermissions, updateBrowserPermission, updateSafePermission],
  )

  const handleAllowAll = useCallback(
    (event: React.MouseEvent, origin: string) => {
      event.preventDefault()
      updateAllPermissions(origin, true)
    },
    [updateAllPermissions],
  )

  const handleClearAll = useCallback(
    (event: React.MouseEvent, origin: string) => {
      event.preventDefault()
      updateAllPermissions(origin, false)
    },
    [updateAllPermissions],
  )

  const handleRemoveApp = useCallback(
    (event: React.MouseEvent, origin: string) => {
      event.preventDefault()
      removeSafePermissions(origin)
      removeBrowserPermissions(origin)
    },
    [removeBrowserPermissions, removeSafePermissions],
  )

  const appNames = useMemo(() => {
    const appNames = allSafeApps.reduce((acc: Record<string, string>, app: SafeAppData) => {
      acc[app.url] = app.name
      return acc
    }, {})

    return appNames
  }, [allSafeApps])

  if (!allSafeApps.length) {
    return <div />
  }

  return (
    <Paper sx={{ padding: 4 }} variant="outlined">
      <Typography variant="h4" fontWeight={700}>
        Safe Apps Permissions
      </Typography>
      <br />
      {!domains.length && <Typography variant="body1">There are no Safe Apps using permissions</Typography>}
      {domains.map((domain) => (
        <Grid
          item
          key={domain}
          sx={({ palette }) => ({
            border: `2px solid ${palette.border.light}`,
            borderRadius: '8px',
            marginBottom: '16px',
          })}
        >
          <Grid
            container
            sx={({ palette }) => ({
              padding: '15px 24px',
              borderBottom: `2px solid ${palette.border.light}`,
            })}
          >
            <Grid
              item
              xs={12}
              sm={5}
              sx={{
                padding: '9px 0',
              }}
            >
              <Typography variant="body1" fontWeight={700}>
                {appNames[domain]}
              </Typography>
              <Typography variant="body2">{domain}</Typography>
            </Grid>
            <Grid container item xs={12} sm={7}>
              {safePermissions[domain]?.map(({ parentCapability, caveats }) => {
                return (
                  <Grid key={parentCapability} item xs={12} sm={6} lg={4} xl={3}>
                    <PermissionsCheckbox
                      name={parentCapability}
                      label={SAFE_PERMISSIONS_TEXTS[parentCapability].displayName}
                      onChange={(_, checked: boolean) => handleSafePermissionsChange(domain, parentCapability, checked)}
                      checked={!isUserRestricted(caveats)}
                    />
                  </Grid>
                )
              })}
              {browserPermissions[domain]?.map(({ feature, status }) => {
                return (
                  <Grid key={feature} item xs={12} sm={6} lg={4} xl={3}>
                    <PermissionsCheckbox
                      name={feature.toString()}
                      label={BROWSER_PERMISSIONS_TEXTS[feature].displayName}
                      onChange={(_, checked: boolean) => handleBrowserPermissionsChange(domain, feature, checked)}
                      checked={status === PermissionStatus.GRANTED ? true : false}
                    />
                  </Grid>
                )
              })}
            </Grid>
          </Grid>
          <Grid
            container
            item
            justifyContent="flex-end"
            sx={{
              padding: '12px 24px',
            }}
          >
            <Link href="#" onClick={(event) => handleAllowAll(event, domain)} sx={{ textDecoration: 'none' }}>
              Allow all
            </Link>
            <Link
              href="#"
              color="error"
              onClick={(event) => handleClearAll(event, domain)}
              sx={{ textDecoration: 'none' }}
              ml={2}
            >
              Clear all
            </Link>
            <Link href="#" color="error" onClick={(event) => handleRemoveApp(event, domain)} ml={2}>
              <DeleteIcon color="error" />
            </Link>
          </Grid>
        </Grid>
      ))}
    </Paper>
  )
}

export default SafeAppsPermissions
