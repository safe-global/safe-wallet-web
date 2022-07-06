import { ReactElement, ReactNode } from 'react'
import { DataDecoded, Operation } from '@gnosis.pm/safe-react-gateway-sdk'
import { Accordion, AccordionDetails, AccordionSummary, Typography } from '@mui/material'
import CodeIcon from '@mui/icons-material/Code'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { isDeleteAllowance, isSetAllowance } from '@/utils/transaction-guards'
import { InfoDetails } from '@/components/transactions/TxDetails/TxData/SettingsChange'
import { AddressInfo } from '@/components/transactions/TxDetails/TxData'
import css from './styles.module.css'

interface Props {
  actionTitle: string
  method: string
  children: ReactNode
  txDetails: {
    title: string
    address: string
    name?: string
    avatarUrl?: string
    dataDecoded: DataDecoded | null
    operation: Operation
  }
}

const MultisendTxsDecoded = ({ actionTitle, method, children, txDetails }: Props): ReactElement => {
  const isDelegateCall = txDetails.operation === Operation.DELEGATE
  const isSpendingLimitMethod =
    isSetAllowance(txDetails.dataDecoded?.method) || isDeleteAllowance(txDetails.dataDecoded?.method)

  return (
    <Accordion
      sx={({ palette }) => ({
        border: 'none',
        boxShadow: 0,
        '&:not(:last-child)': {
          borderRadius: 0,
          borderBottom: `2px solid ${palette.border.light}`,
        },
        '&:last-of-type': {
          borderBottomLeftRadius: '8px',
        },
        '&.Mui-expanded': { margin: 0 },
      })}
      defaultExpanded={isDelegateCall}
    >
      <AccordionSummary
        sx={{ '&.Mui-expanded': { minHeight: '48px' }, '& .MuiAccordionSummary-content.Mui-expanded': { margin: '0' } }}
        expandIcon={<ExpandMoreIcon />}
      >
        <div className={css.summary}>
          <CodeIcon />
          <Typography>{actionTitle}</Typography>
          <Typography ml="8px">
            <b>{method}</b>
          </Typography>
        </div>
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
