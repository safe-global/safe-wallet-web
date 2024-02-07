import useBalances from '@/hooks/useBalances'
import { useAppSelector } from '@/store'
import { selectOutgoingTransactions } from '@/store/txHistorySlice'
import { useMemo } from 'react'
import { Card, WidgetBody, WidgetContainer } from '@/components/dashboard/styled'
import { Button, CircularProgress, Grid, Link, Typography } from '@mui/material'
import CircleOutlinedIcon from '@mui/icons-material/CircleOutlined'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import css from './styles.module.css'

const calculateProgress = (items: StatusProgressItems) => {
  const totalNumberOfItems = items.length
  const completedItems = items.filter((item) => item.completed)
  return Math.round((completedItems.length / totalNumberOfItems) * 100)
}

const StatusCard = ({
  badge,
  step,
  title,
  content,
  completed,
}: {
  badge: string
  step: number
  title: string
  content: string
  completed: boolean
}) => {
  return (
    <Card className={css.card}>
      <div className={css.topBadge}>
        <Typography variant="body2">{badge}</Typography>
      </div>
      <div className={css.status}>
        {completed ? (
          <CheckCircleRoundedIcon color="primary" fontSize="medium" />
        ) : (
          <CircleOutlinedIcon color="inherit" fontSize="medium" />
        )}
      </div>
      <Typography variant="h4" fontWeight="bold" mb={2}>
        <span className={css.circleBadge}>{step}</span>
        {title}
      </Typography>
      <Typography>{content}</Typography>
    </Card>
  )
}

type StatusProgressItem = {
  title: string
  content: string
  completed?: boolean
}

type StatusProgressItems = Array<StatusProgressItem>

const FirstStepsContent: StatusProgressItems = [
  {
    title: 'Add funds',
    content: 'Receive assets to start interacting with your account.',
  },
  {
    title: 'Create your first transaction',
    content: 'Do a simple transfer or use a safe app to create your first transaction.',
  },
]

const FirstSteps = () => {
  const { balances } = useBalances()
  const outgoingTransactions = useAppSelector(selectOutgoingTransactions)

  const hasNonZeroBalance = balances && (balances.items.length > 1 || BigInt(balances.items[0]?.balance || 0) > 0)
  const hasOutgoingTransactions = !!outgoingTransactions && outgoingTransactions.length > 0

  const items = useMemo(
    () => [
      { ...FirstStepsContent[0], completed: hasNonZeroBalance },
      { ...FirstStepsContent[1], completed: hasOutgoingTransactions },
    ],
    [hasNonZeroBalance, hasOutgoingTransactions],
  )

  const activateAccount = () => {
    // TODO: Open safe deployment flow
  }

  const progress = calculateProgress(items)
  const stepsCompleted = items.filter((item) => item.completed).length
  const isCounterfactual = false // TODO: Add real check here

  if (!isCounterfactual) return null

  return (
    <WidgetContainer>
      <WidgetBody>
        <Grid container gap={3} mb={2} flexWrap="nowrap">
          <Grid item position="relative">
            <CircularProgress variant="determinate" value={100} className={css.circleBg} size={60} thickness={5} />
            <CircularProgress
              variant="determinate"
              value={progress}
              className={css.circleProgress}
              size={60}
              thickness={5}
            />
          </Grid>
          <Grid item>
            <Typography component="div" variant="h2" fontWeight={700} mb={1}>
              Activate your Safe Account
            </Typography>
            <Typography variant="body2">
              <strong>
                {stepsCompleted} of {items.length} steps completed.
              </strong>{' '}
              {progress === 100 ? (
                <>
                  Congratulations! You finished the first steps. <Link>Hide this section</Link>
                </>
              ) : (
                'Finish the next steps to start using all Safe Account features:'
              )}
            </Typography>
          </Grid>
        </Grid>
        <Grid container spacing={3}>
          {items.map((item, index) => {
            return (
              <Grid item xs={12} md={4} key={item.title}>
                <StatusCard
                  badge="First steps"
                  step={index + 1}
                  title={item.title}
                  content={item.content}
                  completed={item.completed}
                />
              </Grid>
            )
          })}

          <Grid item xs={12} md={4}>
            <Card className={css.card}>
              <Typography variant="h4" fontWeight="bold" mb={2}>
                Skip first steps
              </Typography>
              <Typography mb={2}>Pay a network fee to immediately access all Safe Account features.</Typography>
              <Button variant="contained" onClick={activateAccount}>
                Activate Safe Account
              </Button>
            </Card>
          </Grid>
        </Grid>
      </WidgetBody>
    </WidgetContainer>
  )
}

export default FirstSteps
