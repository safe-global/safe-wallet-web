import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import {
  Accordion,
  AccordionSummary,
  Avatar,
  Box,
  Typography,
  AccordionDetails,
  SvgIcon,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from '@mui/material'
import { useMemo } from 'react'
import type { ReactElement } from 'react'

import { useCurrentChain } from '@/hooks/useChains'
import Question from '@/public/images/common/question.svg'

import css from './styles.module.css'

const HintAccordion = ({ title, items }: { title: string; items: Array<string> }): ReactElement => {
  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography className={css.title}>
          <SvgIcon component={Question} inheritViewBox className={css.questionIcon} />
          {title}
        </Typography>
      </AccordionSummary>

      <AccordionDetails sx={{ p: 0 }}>
        <List className={css.list}>
          {items.map((item, i) => (
            <ListItem key={i} sx={{ p: 0 }}>
              <ListItemAvatar className={css.listItemAvatar}>
                <Avatar className={css.avatar}>{i + 1}</Avatar>
              </ListItemAvatar>
              <ListItemText primary={item} sx={{ m: 0 }} primaryTypographyProps={{ variant: 'body2' }} />
            </ListItem>
          ))}
        </List>
      </AccordionDetails>
    </Accordion>
  )
}

const ConnectionSteps = [
  'Open a WalletConnect supported dApp',
  'Select WalletConnect as the connection method',
  'Copy the pairing URI and paste it into the input field above',
  'Approve the session',
  'dApp is now connected to the Safe',
]

export const Hints = (): ReactElement => {
  const chain = useCurrentChain()

  const InteractionSteps = useMemo(() => {
    return [
      'Connect a dApp by following the above steps',
      `Ensure the dApp is connected to ${chain?.chainName ?? 'this chain'}`,
      'Initiate a transaction/signature request via the dApp',
      'Transact/sign as normal via the Safe',
    ]
  }, [chain?.chainName])

  return (
    <Box display="flex" flexDirection="column" gap={1}>
      <HintAccordion title="How do I connect to a dApp?" items={ConnectionSteps} />
      <HintAccordion title="How do I interact with a dApp?" items={InteractionSteps} />
    </Box>
  )
}
