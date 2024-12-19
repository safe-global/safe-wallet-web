import { render, waitFor } from '@/tests/test-utils'
import CooldownButton from './index'

describe('CooldownButton', () => {
  beforeAll(() => {
    jest.useFakeTimers()
  })

  afterAll(() => {
    jest.useRealTimers()
  })
  it('should be disabled initially if startDisabled is set and become enabled after <cooldown> seconds', async () => {
    const onClickEvent = jest.fn()
    const result = render(
      <CooldownButton cooldown={30} onClick={onClickEvent} startDisabled>
        Try again
      </CooldownButton>,
    )

    expect(result.getByRole('button')).toBeDisabled()
    expect(result.getByText('Try again in 30s')).toBeVisible()

    jest.advanceTimersByTime(10_000)

    await waitFor(() => {
      expect(result.getByRole('button')).toBeDisabled()
      expect(result.getByText('Try again in 20s')).toBeVisible()
    })

    jest.advanceTimersByTime(5_000)

    await waitFor(() => {
      expect(result.getByRole('button')).toBeDisabled()
      expect(result.getByText('Try again in 15s')).toBeVisible()
    })

    jest.advanceTimersByTime(15_000)

    await waitFor(() => {
      expect(result.getByRole('button')).toBeEnabled()
    })
    result.getByRole('button').click()

    expect(onClickEvent).toHaveBeenCalledTimes(1)
    await waitFor(() => {
      expect(result.getByRole('button')).toBeDisabled()
    })
  })

  it('should be enabled initially if startDisabled is not set and become disabled after click', async () => {
    const onClickEvent = jest.fn()
    const result = render(
      <CooldownButton cooldown={30} onClick={onClickEvent}>
        Try again
      </CooldownButton>,
    )

    expect(result.getByRole('button')).toBeEnabled()
    result.getByRole('button').click()

    expect(onClickEvent).toHaveBeenCalledTimes(1)

    await waitFor(() => {
      expect(result.getByRole('button')).toBeDisabled()
      expect(result.getByText('Try again in 30s')).toBeVisible()
    })

    jest.advanceTimersByTime(30_000)

    await waitFor(() => {
      expect(result.getByRole('button')).toBeEnabled()
    })
    result.getByRole('button').click()

    expect(onClickEvent).toHaveBeenCalledTimes(2)
  })
})
