import { Paper, Grid, Typography, Button, SvgIcon, Tooltip, IconButton } from '@mui/material'
import { useContext, useMemo, useState } from 'react'
import type { ReactElement } from 'react'

import AddIcon from '@/public/images/common/add.svg'
import EditIcon from '@/public/images/common/edit.svg'
import CheckWallet from '@/components/common/CheckWallet'
import EthHashInfo from '@/components/common/EthHashInfo'
import ExternalLink from '@/components/common/ExternalLink'
import { CreateSubaccount } from '@/components/tx-flow/flows/CreateSubaccount'
import EntryDialog from '@/components/address-book/EntryDialog'
import { TxModalContext } from '@/components/tx-flow'
import EnhancedTable from '@/components/common/EnhancedTable'
import useSafeInfo from '@/hooks/useSafeInfo'
import { useGetSafesByOwnerQuery } from '@/store/slices'

import tableCss from '@/components/common/EnhancedTable/styles.module.css'
import Track from '@/components/common/Track'
import { SUBACCOUNT_EVENTS } from '@/services/analytics/events/subaccounts'
import { skipToken } from '@reduxjs/toolkit/query'

export function SubaccountsList(): ReactElement | null {
  const { setTxFlow } = useContext(TxModalContext)
  const [addressToRename, setAddressToRename] = useState<string | null>(null)

  const { safe, safeLoaded, safeAddress } = useSafeInfo()
  const { data: subaccounts } = useGetSafesByOwnerQuery(
    safeLoaded ? { chainId: safe.chainId, ownerAddress: safeAddress } : skipToken,
  )

  const rows = useMemo(() => {
    return subaccounts?.safes.map((subaccount) => {
      return {
        cells: {
          owner: {
            rawValue: subaccount,
            content: (
              <EthHashInfo address={subaccount} showCopyButton shortAddress={false} showName={true} hasExplorer />
            ),
          },
          actions: {
            rawValue: '',
            sticky: true,
            content: (
              <div className={tableCss.actions}>
                <CheckWallet>
                  {(isOk) => (
                    <Track {...SUBACCOUNT_EVENTS.RENAME}>
                      <Tooltip title={isOk ? 'Rename Subaccount' : undefined}>
                        <span>
                          <IconButton onClick={() => setAddressToRename(subaccount)} size="small" disabled={!isOk}>
                            <SvgIcon component={EditIcon} inheritViewBox fontSize="small" color="border" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Track>
                  )}
                </CheckWallet>
              </div>
            ),
          },
        },
      }
    })
  }, [subaccounts?.safes])

  return (
    <>
      <Paper sx={{ padding: 4, mt: 2 }}>
        <Grid container direction="row" justifyContent="space-between" spacing={3} mb={2}>
          <Grid item lg={4} xs={12}>
            <Typography variant="h4" fontWeight={700}>
              Subaccounts
            </Typography>
          </Grid>

          <Grid item xs>
            <Typography sx={{ mb: 3 }}>
              Subaccounts are separate wallets owned by your main Account, perfect for organizing different funds and
              projects.{' '}
              <ExternalLink
                // TODO: Add link
                href="#"
              >
                Learn more
              </ExternalLink>
            </Typography>

            {subaccounts?.safes.length === 0 && (
              <Typography sx={{ mb: 3 }}>
                You don&apos;t have any Subaccounts yet. Set one up now to better organize your assets
              </Typography>
            )}

            <CheckWallet>
              {(isOk) => (
                <Button
                  onClick={() => setTxFlow(<CreateSubaccount />)}
                  variant="text"
                  startIcon={<SvgIcon component={AddIcon} inheritViewBox fontSize="small" />}
                  disabled={!isOk}
                  sx={{ mb: 3 }}
                >
                  Add Subaccount
                </Button>
              )}
            </CheckWallet>

            {rows && rows.length > 0 && <EnhancedTable rows={rows} headCells={[]} />}
          </Grid>
        </Grid>
      </Paper>

      {addressToRename && (
        <EntryDialog
          handleClose={() => setAddressToRename(null)}
          defaultValues={{ name: '', address: addressToRename }}
          chainIds={[safe.chainId]}
          disableAddressInput
        />
      )}
    </>
  )
}
