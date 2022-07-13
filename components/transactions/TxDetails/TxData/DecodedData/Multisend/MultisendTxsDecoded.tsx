import { ReactElement, ReactNode } from 'react'
import { DataDecoded, Operation } from '@gnosis.pm/safe-react-gateway-sdk'
import { Accordion, AccordionDetails, AccordionSummary, Typography } from '@mui/material'
import CodeIcon from '@mui/icons-material/Code'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { isDeleteAllowance, isSetAllowance } from '@/utils/transaction-guards'
import { InfoDetails } from '@/components/transactions/InfoDetails'
import EthHashInfo from '@/components/common/EthHashInfo'
import { DelegateCallWarning } from '@/components/transactions/Warning'
import css from './styles.module.css'

type MultisendTxsDecodedProps = {
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

const MultisendTxsDecoded = ({ actionTitle, method, children, txDetails }: MultisendTxsDecodedProps): ReactElement => {
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

      <AccordionDetails
        sx={{ flexFlow: 'column', borderTopWidth: '2px', borderTopStyle: 'solid', borderTopColor: 'border.light' }}
      >
        {/* We always warn of nested delegate calls */}
        {isDelegateCall && <DelegateCallWarning showWarning={isDelegateCall} />}
        {!isSpendingLimitMethod && (
          <InfoDetails title={txDetails.title}>
            <EthHashInfo
              address={txDetails.address}
              name={txDetails.name}
              customAvatar={txDetails.avatarUrl}
              shortAddress={false}
              showCopyButton
              hasExplorer
            />
          </InfoDetails>
        )}
        {children}
      </AccordionDetails>
    </Accordion>
  )
}

export default MultisendTxsDecoded
