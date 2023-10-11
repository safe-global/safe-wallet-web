import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { Accordion, AccordionSummary, Typography, AccordionDetails, SvgIcon } from '@mui/material'
import type { TypographyProps } from '@mui/material'
import type { ReactElement } from 'react'

import Question from '@/public/images/common/question.svg'

const AccordionTitle = ({ children }: { children: TypographyProps['children'] }): ReactElement => {
  return (
    <Typography sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <SvgIcon
        component={Question}
        inheritViewBox
        sx={{ color: 'currentColor', verticalAlign: 'middle', mr: 1 }}
        fontSize="inherit"
      />
      {children}
    </Typography>
  )
}

// TODO: Add content to the hints
export const Hints = (): ReactElement => {
  return (
    <>
      <Accordion sx={{ mb: 1 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <AccordionTitle>How do I connect to a dApp?</AccordionTitle>
        </AccordionSummary>

        <AccordionDetails>
          <Typography>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex, sit amet blandit
            leo lobortis eget.
          </Typography>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <AccordionTitle>How do I interact with a dApp?</AccordionTitle>
        </AccordionSummary>

        <AccordionDetails>
          <Typography>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex, sit amet blandit
            leo lobortis eget.
          </Typography>
        </AccordionDetails>
      </Accordion>
    </>
  )
}
