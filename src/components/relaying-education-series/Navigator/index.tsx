// import { useRelayingEducationSeriesStepper } from '@/components/relaying-education-series'
import { Box, Card, Divider, ListItemButton, SvgIcon, Typography } from '@mui/material'
import RelayerIcon from '@/public/images/common/relayer.svg'
import css from './styles.module.css'

const Steps = [
  {
    title: 'What is relaying?',
    number: '01',
  },
  {
    title: 'How it works?',
    number: '02',
  },
  {
    title: 'Benefits',
    number: '03',
  },
  {
    title: 'Technical information',
    number: '04',
  },
]

const Navigator = ({ setStep }: { setStep: (step: number) => void }) => {
  return (
    <Card className={css.wrapper}>
      <Box className={css.navigatorHeader}>
        <SvgIcon component={RelayerIcon} sx={{ width: 'auto', height: '100%', margin: '0 auto' }} inheritViewBox />
        <Typography variant="h4" fontWeight={700}>
          Gas Balance (Relaying)
        </Typography>
      </Box>
      <Divider />
      <Box className={css.navigatorBody}>
        {Steps.map((step, index) => (
          <ListItemButton key={index} className={css.navigatorBodyItem} onClick={() => setStep(index)}>
            <Typography className={css.step}>{step.number}</Typography>
            <Typography>{step.title}</Typography>
          </ListItemButton>
        ))}
      </Box>
    </Card>
  )
}

export default Navigator
