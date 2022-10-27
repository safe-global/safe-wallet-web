import { CreationStatus } from '@/components/create-safe/status/CreationStatus'
import { act, fireEvent, render } from '@/tests/test-utils'
import type { PendingSafeData } from '@/components/create-safe/types.d'
import * as hooks from '@/components/create-safe/status/useSafeCreation'
import * as status from '@/components/create-safe/status/useStatus'
import * as localStorage from '@/services/local-storage/useLocalStorage'
import * as wrongChain from '@/hooks/useIsWrongChain'
import * as wallet from '@/hooks/wallets/useWallet'
import { SafeCreationStatus } from '@/components/create-safe/status/useSafeCreation'
import { waitFor } from '@testing-library/react'
import type { ConnectedWallet } from '@/hooks/wallets/useOnboard'

describe('CreationStatus', () => {
  const mockParams: PendingSafeData = {
    address: '',
    name: '',
    owners: [],
    saltNonce: 0,
    threshold: 0,
    safeAddress: '0x10',
  }

  it('should display an AWAITING message by default', () => {
    const { getByText } = render(
      <CreationStatus params={mockParams} onSubmit={jest.fn} onBack={jest.fn} setStep={jest.fn} />,
    )

    expect(getByText('Step 1/2: Waiting for transaction confirmation.')).toBeInTheDocument()
  })

  it('should display the txHash if it exists', () => {
    jest.spyOn(hooks, 'useSafeCreation').mockReturnValue({
      txHash: '0x123',
      createSafe: jest.fn(),
    })

    const { getByText } = render(
      <CreationStatus params={mockParams} onSubmit={jest.fn} onBack={jest.fn} setStep={jest.fn} />,
    )

    expect(getByText('Your Safe creation transaction:')).toBeInTheDocument()
    expect(getByText('0x123')).toBeInTheDocument() // We render the address twice for desktop/mobile
  })

  it('should display the safe address if it exists', () => {
    const { getByText } = render(
      <CreationStatus params={mockParams} onSubmit={jest.fn} onBack={jest.fn} setStep={jest.fn} />,
    )

    expect(getByText('0x10')).toBeInTheDocument()
  })

  it('should display a link to the safe on INDEX_FAILED', () => {
    jest.spyOn(status, 'default').mockReturnValue([SafeCreationStatus.INDEX_FAILED, jest.fn()])

    const { getByText } = render(
      <CreationStatus params={mockParams} onSubmit={jest.fn} onBack={jest.fn} setStep={jest.fn} />,
    )

    expect(getByText('Open your Safe')).toBeInTheDocument()
  })

  it('should display a retry button on ERROR', () => {
    jest.spyOn(status, 'default').mockReturnValue([SafeCreationStatus.ERROR, jest.fn()])

    const { getByText } = render(
      <CreationStatus params={mockParams} onSubmit={jest.fn} onBack={jest.fn} setStep={jest.fn} />,
    )

    expect(getByText('Retry')).toBeInTheDocument()
  })

  it('should display a retry button on REVERTED', () => {
    jest.spyOn(status, 'default').mockReturnValue([SafeCreationStatus.REVERTED, jest.fn()])

    const { getByText } = render(
      <CreationStatus params={mockParams} onSubmit={jest.fn} onBack={jest.fn} setStep={jest.fn} />,
    )

    expect(getByText('Retry')).toBeInTheDocument()
  })

  it('should display a retry button on TIMEOUT', () => {
    jest.spyOn(status, 'default').mockReturnValue([SafeCreationStatus.TIMEOUT, jest.fn()])

    const { getByText } = render(
      <CreationStatus params={mockParams} onSubmit={jest.fn} onBack={jest.fn} setStep={jest.fn} />,
    )

    expect(getByText('Retry')).toBeInTheDocument()
  })

  it('should display a retry button on WALLET_REJECTED', () => {
    jest.spyOn(status, 'default').mockReturnValue([SafeCreationStatus.WALLET_REJECTED, jest.fn()])

    const { getByText } = render(
      <CreationStatus params={mockParams} onSubmit={jest.fn} onBack={jest.fn} setStep={jest.fn} />,
    )

    expect(getByText('Retry')).toBeInTheDocument()
  })

  it('should create a safe tx on Retry', async () => {
    jest.spyOn(wallet, 'default').mockReturnValue({} as ConnectedWallet)
    jest.spyOn(wrongChain, 'default').mockReturnValue(false)

    const setStatusMock = jest.fn()
    const createSafeMock = jest.fn()
    jest.spyOn(status, 'default').mockReturnValue([SafeCreationStatus.ERROR, setStatusMock])
    jest.spyOn(hooks, 'useSafeCreation').mockReturnValue({
      txHash: '0x123',
      createSafe: createSafeMock,
    })

    const { getByText } = render(
      <CreationStatus params={mockParams} onSubmit={jest.fn} onBack={jest.fn} setStep={jest.fn} />,
    )

    const button = getByText('Retry')

    await act(() => {
      fireEvent.click(button)
    })

    await waitFor(() => {
      expect(setStatusMock).toHaveBeenCalledWith(SafeCreationStatus.AWAITING)
      expect(createSafeMock).toHaveBeenCalledTimes(1)
    })
  })

  it('should go back to first step and clear cache on Cancel', () => {
    jest.spyOn(status, 'default').mockReturnValue([SafeCreationStatus.ERROR, jest.fn()])

    const setPendingSafeMock = jest.fn()
    jest.spyOn(localStorage, 'default').mockReturnValue([{}, setPendingSafeMock])

    const setStepMock = jest.fn()
    const { getByText } = render(
      <CreationStatus params={mockParams} onSubmit={jest.fn} onBack={jest.fn} setStep={setStepMock} />,
    )

    const button = getByText('Cancel')

    fireEvent.click(button)
    expect(setStepMock).toHaveBeenCalledWith(0)
    expect(setPendingSafeMock).toHaveBeenCalledWith(undefined)
  })
})
