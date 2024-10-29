// Extract status handling into separate components
import { Box, Button, Container, Paper, Stack, SvgIcon, Typography } from '@mui/material'
import { PendingStatus, selectPendingTxById } from '@/store/pendingTxsSlice'
import EthHashInfo from '@/components/common/EthHashInfo'
import ErrorMessage from '@/components/tx/ErrorMessage'
import useAddressBook from '@/hooks/useAddressBook'
import NestedSafeIcon from '@/public/images/transactions/nestedTx.svg'
import ArrowDownIcon from '@/public/images/common/arrow-down.svg'

import css from './styles.module.css'
import Link from 'next/link'
import { AppRoutes } from '@/config/routes'
import { useGetTransactionDetailsQuery } from '@/store/slices'
import { skipToken } from '@reduxjs/toolkit/query'
import { useAppSelector } from '@/store'

type Props = {
  txId: string
}
const NestedTxSuccessScreen = ({ txId }: Props) => {
  const pendingTx = useAppSelector((state) => (txId ? selectPendingTxById(state, txId) : undefined))
  const addressBook = useAddressBook()

  const { data: parentTxData } = useGetTransactionDetailsQuery(
    pendingTx?.status === PendingStatus.NESTED_SIGNING
      ? { chainId: pendingTx.chainId, txId: pendingTx.signingSafeTxHash }
      : skipToken,
  )
  if (!pendingTx) {
    return 'No tx found'
  }
  return pendingTx.status === PendingStatus.NESTED_SIGNING ? (
    <Container
      component={Paper}
      disableGutters
      sx={{
        textAlign: 'center',
        maxWidth: `${900 - 75}px`, // md={11}
      }}
      maxWidth={false}
    >
      <Box padding={3} mt={3} display="flex" flexDirection="column" alignItems="center" gap={2}>
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
          <Box display="flex" flexDirection="column" alignItems="start" gap={1}>
            <Typography variant="body2" color="text.secondary">
              Parent Safe
            </Typography>
            <EthHashInfo
              address={pendingTx.signerAddress}
              name={addressBook[pendingTx.signerAddress]}
              isAddressBookName={Boolean(addressBook[pendingTx.signerAddress])}
              shortAddress={false}
            />
          </Box>
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
              {parentTxData?.txData?.dataDecoded?.method}
            </Typography>
          </Stack>
          <Box display="flex" flexDirection="column" alignItems="start" gap={1}>
            <Typography variant="body2" color="text.secondary">
              Current Safe
            </Typography>
            <EthHashInfo
              address={pendingTx.safeAddress}
              name={addressBook[pendingTx.safeAddress]}
              isAddressBookName={Boolean(addressBook[pendingTx.safeAddress])}
              shortAddress={false}
            />
          </Box>
        </Stack>
        <Link
          href={{
            pathname: AppRoutes.transactions.tx,
            query: {
              safe: pendingTx.signerAddress,
              chainId: pendingTx.chainId,
              id: pendingTx.signingSafeTxHash,
            },
          }}
          passHref
        >
          <Button variant="outlined">Open the transaction</Button>
        </Link>
      </Box>
    </Container>
  ) : (
    <ErrorMessage>No nested signing data found</ErrorMessage>
  )
}

export default NestedTxSuccessScreen
