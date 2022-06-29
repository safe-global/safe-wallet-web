import { ReactElement, ReactNode } from 'react'
import { DataDecoded, Operation } from '@gnosis.pm/safe-react-gateway-sdk'
import { Accordion, AccordionDetails, AccordionSummary, Typography } from '@mui/material'
import CodeIcon from '@mui/icons-material/Code'
import { isDeleteAllowance, isSetAllowance } from '@/utils/transaction-guards'
import { InfoDetails } from '@/components/transactions/TxDetails/TxData/SettingsChange'
import { AddressInfo } from '@/components/transactions/TxDetails/TxData'

interface Props {
  actionTitle: string
  method: string
  children: ReactNode
  txDetails: {
    title: string
    address: string
    name?: string | undefined
    avatarUrl?: string | undefined
    dataDecoded: DataDecoded | null
    operation: Operation
  }
}

const MultisendTxsDecoded = ({ actionTitle, method, children, txDetails }: Props): ReactElement => {
  const isDelegateCall = txDetails.operation === Operation.DELEGATE
  const transactionsValueDecoded = txDetails.dataDecoded
  const isSpendingLimitMethod =
    isSetAllowance(transactionsValueDecoded?.method) || isDeleteAllowance(transactionsValueDecoded?.method)

  return (
    <Accordion defaultExpanded={isDelegateCall || undefined}>
      <AccordionSummary>
        <CodeIcon />
        <Typography ml="8px">
          <b>{method}</b>
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ flexFlow: 'column' }}>
        {/* We always warn of nested delegate calls */}
        {/* {isDelegateCall && <DelegateCallWarning showWarning={isDelegateCall} />} */}
        {!isSpendingLimitMethod && (
          <>
            {/* TODO: these 2 components should not belong in SettingsChange */}
            <InfoDetails title={txDetails.title}>
              <AddressInfo address={txDetails.address} name={txDetails.name} avatarUrl={txDetails.avatarUrl} />
            </InfoDetails>
          </>
        )}
        {children}
      </AccordionDetails>
    </Accordion>
  )
}

export default MultisendTxsDecoded
