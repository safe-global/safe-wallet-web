import { HexEncodedData } from '@/components/transactions/HexEncodedData'
import { Operation } from '@safe-global/safe-gateway-typescript-sdk'
import type { TransactionData } from '@safe-global/safe-gateway-typescript-sdk'
import { useState, useEffect } from 'react'
import type { Dispatch, ReactElement, SetStateAction } from 'react'
import type { AccordionProps } from '@mui/material/Accordion/Accordion'
import SingleTxDecoded from '@/components/transactions/TxDetails/TxData/DecodedData/SingleTxDecoded'
import { AccordionSummary, Box, Button, Divider } from '@mui/material'

type MultisendProps = {
  txData?: TransactionData
  variant?: AccordionProps['variant']
  showDelegateCallWarning?: boolean
  noHeader?: boolean
}

const MIN_MULTISEND_TXS = 3

const multisendScrollSx = {
  'max-height': '168px',
  overflow: 'auto',
  pb: '2em',
  '&:after': {
    content: '""',
    position: 'absolute',
    'z-index': 1,
    bottom: 0,
    left: 0,
    'pointer-events': 'none',
    'background-image': 'linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255, 1) 90%)',
    width: '100%',
    height: '4em',
  },
}

const MultisendActionsHeader = ({
  setOpen,
  amount,
}: {
  setOpen: Dispatch<SetStateAction<Record<number, boolean> | undefined>>
  amount: number
}) => {
  const onClickAll = (expanded: boolean) => () => {
    setOpen(Array(amount).fill(expanded))
  }

  return (
    <AccordionSummary
      sx={{ borderBottom: ({ palette }) => `1px solid ${palette.border.light}`, cursor: 'auto !important', pr: 0 }}
      expandIcon={
        <>
          <Button onClick={onClickAll(true)} variant="text" sx={{ px: '18px' }}>
            Expand all
          </Button>
          <Divider sx={{ my: '14px', borderColor: 'border.light' }} />
          <Button onClick={onClickAll(false)} variant="text" sx={{ px: '18px' }}>
            Collapse all
          </Button>
        </>
      }
    >
      All actions
    </AccordionSummary>
  )
}

export const Multisend = ({
  txData,
  variant = 'elevation',
  showDelegateCallWarning = true,
  noHeader = false,
}: MultisendProps): ReactElement | null => {
  const [openMap, setOpenMap] = useState<Record<number, boolean>>()
  const isOpenMapUndefined = openMap == null

  // multiSend method receives one parameter `transactions`
  const multiSendTransactions = txData?.dataDecoded?.parameters?.[0].valueDecoded

  useEffect(() => {
    // Initialise whether each transaction should be expanded or not
    if (isOpenMapUndefined && multiSendTransactions) {
      setOpenMap(
        multiSendTransactions.map(({ operation }) => {
          return showDelegateCallWarning ? operation === Operation.DELEGATE : false
        }),
      )
    }
  }, [multiSendTransactions, isOpenMapUndefined, showDelegateCallWarning])

  if (!txData) return null

  // ? when can a multiSend call take no parameters?
  if (!txData.dataDecoded?.parameters) {
    if (txData.hexData) {
      return <HexEncodedData title="Data (hex encoded)" hexData={txData.hexData} />
    }
    return null
  }

  if (!multiSendTransactions) {
    return null
  }

  return (
    <>
      {!noHeader && <MultisendActionsHeader setOpen={setOpenMap} amount={multiSendTransactions.length} />}

      <Box sx={multiSendTransactions.length > MIN_MULTISEND_TXS ? multisendScrollSx : undefined}>
        <Box display="flex" flexDirection="column" gap={1}>
          {multiSendTransactions.map(({ dataDecoded, data, value, to, operation }, index) => {
            const onChange: AccordionProps['onChange'] = (_, expanded) => {
              setOpenMap((prev) => ({
                ...prev,
                [index]: expanded,
              }))
            }

            return (
              <SingleTxDecoded
                key={`${data ?? to}-${index}`}
                tx={{
                  dataDecoded,
                  data,
                  value,
                  to,
                  operation,
                }}
                txData={txData}
                showDelegateCallWarning={showDelegateCallWarning}
                actionTitle={`Action ${index + 1}`}
                variant={variant}
                expanded={openMap?.[index] ?? false}
                onChange={onChange}
              />
            )
          })}
        </Box>
      </Box>
    </>
  )
}

export default Multisend
