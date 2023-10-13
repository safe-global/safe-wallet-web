import { useCallback, useMemo, useState } from 'react'
import { Box, Grid, Typography, SvgIcon, IconButton, Tooltip, Button } from '@mui/material'
import CheckIcon from '@mui/icons-material/Check'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import type { ReactElement } from 'react'

import useSafeInfo from '@/hooks/useSafeInfo'
import { useWeb3 } from '@/hooks/wallets/web3'
import CheckWallet from '@/components/common/CheckWallet'
import EnhancedTable from '@/components/common/EnhancedTable'
import EditIcon from '@/public/images/common/edit.svg'
import DeleteIcon from '@/public/images/common/delete.svg'
import AddIcon from '@/public/images/common/add.svg'
import { isVerifiedOwner } from './email-verification'

import tableCss from '@/components/common/EnhancedTable/styles.module.css'

const headCells = [
  { id: 'email', label: 'Email address' },
  { id: 'actions', label: '', sticky: true },
]

const useChallengeIsOwner = () => {
  const { safeAddress, safe } = useSafeInfo()
  const web3 = useWeb3()

  return useCallback(() => {
    if (!web3) {
      return false
    }

    return isVerifiedOwner({
      owners: safe.owners.map((owner) => owner.value),
      chainId: safe.chainId,
      safeAddress,
      provider: web3,
    })
  }, [safe.chainId, safe.owners, safeAddress, web3])
}

export const Email = (): ReactElement => {
  const { safeAddress, safe } = useSafeInfo()
  const web3 = useWeb3()

  const [emails, setEmails] = useState([{ value: 'john@smith.com', isVerified: false }])
  const [isShown, setIsShown] = useState(false)

  const challendgeIsOwner = useChallengeIsOwner()

  const onShow = useCallback(async () => {
    if (isShown) {
      return
    }

    const isOwner = await (async () => {
      if (!web3) {
        return false
      }

      return isVerifiedOwner({
        owners: safe.owners.map((owner) => owner.value),
        chainId: safe.chainId,
        safeAddress,
        provider: web3,
      })
    })()

    setIsShown(isOwner)
  }, [isShown, safe.chainId, safe.owners, safeAddress, web3])

  const onHide = () => {
    setIsShown(false)
  }

  const onVerify = useCallback(async (emailAddress: string) => {
    setEmails((prev) => {
      return prev.map((email) => {
        if (email.value === emailAddress) {
          email.isVerified = true
        }
        return email
      })
    })

    alert('Mock verified')
  }, [])

  const onEdit = useCallback(
    async (emailAddress: string) => {
      const newEmailAddress = prompt('Edit email address', emailAddress)

      if (!newEmailAddress) {
        return
      }

      const isOwner = await challendgeIsOwner()

      if (!isOwner) {
        return
      }

      setEmails((prev) => {
        return prev.map((email) => {
          if (email.value === emailAddress) {
            email.value = newEmailAddress
          }
          return email
        })
      })
    },
    [challendgeIsOwner],
  )

  const onDelete = useCallback(
    async (emailAddress: string) => {
      const isOk = confirm(`Are you sure you want to delete ${emailAddress}?`)

      if (!isOk) {
        return
      }

      const isOwner = await challendgeIsOwner()

      if (!isOwner) {
        return
      }

      setEmails((prev) => {
        return prev.filter((email) => {
          return email.value !== emailAddress
        })
      })
    },
    [challendgeIsOwner],
  )

  const onAdd = useCallback(async () => {
    const newEmailAddress = prompt('Add new email address')
    if (!newEmailAddress) {
      return
    }

    const isAuth = await challendgeIsOwner()

    if (!isAuth) {
      return
    }

    setEmails((prev) => {
      return prev.concat([{ value: newEmailAddress, isVerified: false }])
    })
  }, [challendgeIsOwner])

  const rows = useMemo(() => {
    return emails.map((email) => {
      const value = isShown ? email.value : '**********'

      return {
        cells: {
          owner: {
            rawValue: value,
            content: (
              <Box display="flex" alignItems="center">
                {value}
                {isShown ? (
                  email.isVerified ? (
                    <CheckIcon fontSize="small" sx={{ color: 'success.main' }} />
                  ) : (
                    <button onClick={() => onVerify(value)}>Verify</button>
                  )
                ) : null}
              </Box>
            ),
          },
          actions: {
            rawValue: '',
            sticky: true,
            content: (
              <div className={tableCss.actions}>
                <CheckWallet>
                  {(isOk) => (
                    <Tooltip title={isOk ? (isShown ? 'Hide email address' : 'Show email address') : undefined}>
                      <span>
                        <IconButton onClick={isShown ? onHide : onShow} size="small" disabled={!isOk}>
                          <SvgIcon
                            component={isShown ? VisibilityOffIcon : VisibilityIcon}
                            inheritViewBox
                            color="border"
                            fontSize="small"
                          />
                        </IconButton>
                      </span>
                    </Tooltip>
                  )}
                </CheckWallet>

                <CheckWallet>
                  {(isOk) => (
                    <Tooltip
                      title={
                        isOk ? (isShown ? 'Edit email address' : 'Show email address first to edit it') : undefined
                      }
                    >
                      <span>
                        <IconButton onClick={() => onEdit(email.value)} size="small" disabled={!isOk || !isShown}>
                          <SvgIcon component={EditIcon} inheritViewBox color="border" fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                  )}
                </CheckWallet>

                <CheckWallet>
                  {(isOk) => (
                    <Tooltip
                      title={
                        isOk ? (isShown ? 'Remove email address' : 'Show email address first to delete it') : undefined
                      }
                    >
                      <span>
                        <IconButton onClick={() => onDelete(email.value)} size="small" disabled={!isOk || !isShown}>
                          <SvgIcon component={DeleteIcon} inheritViewBox color="error" fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                  )}
                </CheckWallet>
              </div>
            ),
          },
        },
      }
    })
  }, [emails, isShown, onDelete, onEdit, onShow, onVerify])

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Grid container spacing={3}>
        <Grid item lg={4} xs={12}>
          <Typography variant="h4" fontWeight={700}>
            Manage email addresses
          </Typography>
        </Grid>

        <Grid item xs>
          <Typography mb={2}>Edit or remove existing email addresses.</Typography>

          <EnhancedTable rows={rows} headCells={headCells} />

          <Box pt={2}>
            <CheckWallet>
              {(isOk) => (
                <Button
                  onClick={onAdd}
                  variant="text"
                  startIcon={<SvgIcon component={AddIcon} inheritViewBox fontSize="small" />}
                  disabled={!isOk || !isShown}
                >
                  Add new email
                </Button>
              )}
            </CheckWallet>
          </Box>
        </Grid>
      </Grid>
    </Box>
  )
}
