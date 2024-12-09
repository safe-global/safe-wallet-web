import { useState, useEffect } from 'react'
import { Stack, Container, Paper, Box, SvgIcon, Typography } from '@mui/material'
import { PendingStatus, selectPendingTxById } from '@/store/pendingTxsSlice'
import EthHashInfo from '@/components/common/EthHashInfo'
import ErrorMessage from '@/components/tx/ErrorMessage'
import useAddressBook from '@/hooks/useAddressBook'
import NestedSafeIcon from '@/public/images/transactions/nestedTx.svg'
import ArrowDownIcon from '@/public/images/common/arrow-down.svg'

import css from './styles.module.css'
import Link from 'next/link'
import { AppRoutes } from '@/config/routes'
import { useAppSelector } from '@/store'
import ExternalLink from '@/components/common/ExternalLink'
import { MODALS_EVENTS } from '@/services/analytics'
import Track from '@/components/common/Track'
import useAsync from '@/hooks/useAsync'
import { getSafeTransaction } from '@/utils/transactions'
import { isMultisigDetailedExecutionInfo } from '@/utils/transaction-guards'

type Props = {
  txId: string
}
const NestedTxSuccessScreen = ({ txId }: Props) => {
  const addressBook = useAddressBook()

  // _pendingTx eventually clears from the store, so we need to cache it
  const _pendingTx = useAppSelector((state) => (txId ? selectPendingTxById(state, txId) : undefined))
  const [cachedPendingTx, setCachedPendingTx] = useState(_pendingTx)
  useEffect(() => {
    if (_pendingTx) {
      setCachedPendingTx(_pendingTx)
    }
  }, [_pendingTx])

  const [safeTx] = useAsync(() => {
    if (cachedPendingTx?.status == PendingStatus.NESTED_SIGNING) {
      return getSafeTransaction(
        cachedPendingTx.txHashOrParentSafeTxHash,
        cachedPendingTx.chainId,
        cachedPendingTx.signerAddress,
      )
    }
  }, [cachedPendingTx])
  const isSafeTxHash =
    cachedPendingTx?.status == PendingStatus.NESTED_SIGNING &&
    !!safeTx &&
    isMultisigDetailedExecutionInfo(safeTx.detailedExecutionInfo) &&
    safeTx.detailedExecutionInfo.safeTxHash === cachedPendingTx.txHashOrParentSafeTxHash

  if (cachedPendingTx?.status !== PendingStatus.NESTED_SIGNING) {
    return <ErrorMessage>No transaction data found</ErrorMessage>
  }

  const currentSafeAddress = addressBook[cachedPendingTx.safeAddress]
  const parentSafeAddress = addressBook[cachedPendingTx.signerAddress]

  return (
    <Container
      component={Paper}
      disableGutters
      sx={{
        textAlign: 'center',
        maxWidth: `${900 - 75}px`, // md={11}
      }}
      maxWidth={false}
    >
      <Stack padding={3} mt={3} alignItems="center" spacing={2}>
        <Box className={css.icon}>
          <SvgIcon component={NestedSafeIcon} inheritViewBox fontSize="large" alt="Nested Safe" />
        </Box>
        <Typography data-testid="transaction-status" variant="h6" marginTop={2} fontWeight={700}>
          A nested transaction was created
        </Typography>
        <Typography variant="body2" mb={3}>
          Once confirmed and executed this signer transaction will confirm the child Safe&apos;s transaction.
        </Typography>
        <Stack spacing={2} width="70%">
          <Stack alignItems="start" spacing={1}>
            <Typography variant="body2" color="text.secondary">
              Parent Safe
            </Typography>
            <EthHashInfo
              address={cachedPendingTx.signerAddress}
              name={parentSafeAddress}
              isAddressBookName={Boolean(parentSafeAddress)}
              shortAddress={false}
            />
          </Stack>
          <Stack direction="row" spacing={2} alignItems="center" pl={1}>
            <SvgIcon component={ArrowDownIcon} fontSize="medium" color="border" inheritViewBox />
            <Typography
              component="code"
              variant="body2"
              color="primary.light"
              sx={{
                backgroundColor: 'background.main',
                px: 1,
                py: 0.5,
                borderRadius: 0.5,
                fontFamily: 'monospace',
                whiteSpace: 'nowrap',
              }}
            >
              approveHash
            </Typography>
          </Stack>
          <Stack alignItems="start" spacing={1}>
            <Typography variant="body2" color="text.secondary">
              Current Safe
            </Typography>
            <EthHashInfo
              address={cachedPendingTx.safeAddress}
              name={currentSafeAddress}
              isAddressBookName={Boolean(currentSafeAddress)}
              shortAddress={false}
            />
          </Stack>
        </Stack>
        <Track {...MODALS_EVENTS.OPEN_PARENT_TX}>
          <Link
            href={
              isSafeTxHash
                ? {
                    pathname: AppRoutes.transactions.tx,
                    query: {
                      safe: cachedPendingTx.signerAddress,
                      chainId: cachedPendingTx.chainId,
                      id: cachedPendingTx.txHashOrParentSafeTxHash,
                    },
                  }
                : {
                    pathname: AppRoutes.transactions.queue,
                    query: {
                      safe: cachedPendingTx.signerAddress,
                      chainId: cachedPendingTx.chainId,
                    },
                  }
            }
            passHref
            legacyBehavior
          >
            <ExternalLink mode="button">Open the transaction</ExternalLink>
          </Link>
        </Track>
      </Stack>
    </Container>
  )
}

export default NestedTxSuccessScreen
