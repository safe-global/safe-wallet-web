import { renderHook } from '@testing-library/react'
import { useShowOutreachPopup } from '../useShowOutreachPopup'
import * as useIsSafeOwner from '@/hooks/useIsSafeOwner'
import * as useSafeAddress from '@/hooks/useSafeAddress'
import * as store from '@/store'
import { faker } from '@faker-js/faker'

jest.mock('@/hooks/useIsSafeOwner')
jest.mock('@/hooks/useSafeAddress')
jest.mock('@/store')

describe('useShowOutreachPopup', () => {
  it('should return false if the connected wallet is not a signer of a targeted safe', async () => {
    jest.spyOn(useIsSafeOwner, 'default').mockReturnValueOnce(false)
    jest.spyOn(useSafeAddress, 'default').mockReturnValueOnce('0x5Cd167cd2D246B19834726904FA3247362182f6F')
    jest.spyOn(store, 'useAppSelector').mockReturnValueOnce({ open: false })

    const { result } = renderHook(() => useShowOutreachPopup({}))
    expect(result.current).toEqual(false)
  })

  it('should return false when the cookie banner is open', async () => {
    jest.spyOn(useIsSafeOwner, 'default').mockReturnValueOnce(true)
    jest.spyOn(useSafeAddress, 'default').mockReturnValueOnce('0x5Cd167cd2D246B19834726904FA3247362182f6F')
    jest.spyOn(store, 'useAppSelector').mockReturnValueOnce({ open: true })

    const { result } = renderHook(() => useShowOutreachPopup({}))
    expect(result.current).toEqual(false)
  })

  it('should return true for signers of targeted safes', async () => {
    jest.spyOn(useIsSafeOwner, 'default').mockReturnValueOnce(true)
    jest.spyOn(useSafeAddress, 'default').mockReturnValueOnce('0x5Cd167cd2D246B19834726904FA3247362182f6F')
    jest.spyOn(store, 'useAppSelector').mockReturnValueOnce({ open: false })

    const { result } = renderHook(() => useShowOutreachPopup({}))
    expect(result.current).toEqual(true)
  })

  it('should return false if a targeted user has previously closed the popup', async () => {
    jest.spyOn(useIsSafeOwner, 'default').mockReturnValueOnce(true)
    jest.spyOn(useSafeAddress, 'default').mockReturnValueOnce('0x5Cd167cd2D246B19834726904FA3247362182f6F')
    jest.spyOn(store, 'useAppSelector').mockReturnValueOnce({ open: false })

    const outreachPopupLocalStorage = {
      isClosed: true,
      askAgainLater: undefined,
      activityTimestamps: undefined,
    }

    const { result } = renderHook(() => useShowOutreachPopup(outreachPopupLocalStorage))
    expect(result.current).toEqual(false)
  })

  it('should return false if the user has chosen ask me later and the minimum time threshold has not elapsed', async () => {
    jest.spyOn(useIsSafeOwner, 'default').mockReturnValueOnce(true)
    jest.spyOn(useSafeAddress, 'default').mockReturnValueOnce('0x5Cd167cd2D246B19834726904FA3247362182f6F')
    jest.spyOn(store, 'useAppSelector').mockReturnValueOnce({ open: false })

    const now = Date.now()
    const firstTimestamp = Date.now() - 24 * 60 * 60 * 1000 // 1 day
    const fakerTimestamps = faker.date
      .betweens({ from: firstTimestamp, to: now, count: 3 })
      .map((date) => date.getTime())

    const outreachPopupLocalStorage = {
      isClosed: false,
      askAgainLater: true,
      activityTimestamps: [firstTimestamp, ...fakerTimestamps],
    }

    const { result } = renderHook(() => useShowOutreachPopup(outreachPopupLocalStorage))
    expect(result.current).toEqual(false)
  })

  it('should return true if the user has chosen ask me later and the maximum time has elapsed', async () => {
    jest.spyOn(useIsSafeOwner, 'default').mockReturnValueOnce(true)
    jest.spyOn(useSafeAddress, 'default').mockReturnValueOnce('0x5Cd167cd2D246B19834726904FA3247362182f6F')
    jest.spyOn(store, 'useAppSelector').mockReturnValueOnce({ open: false })

    const now = Date.now()
    const firstTimestamp = Date.now() - 11 * 24 * 60 * 60 * 1000 // 11 days
    const fakerTimestamps = faker.date
      .betweens({ from: firstTimestamp, to: now, count: 3 }) // 3 visits
      .map((date) => date.getTime())

    const outreachPopupLocalStorage = {
      isClosed: false,
      askAgainLater: true,
      activityTimestamps: [firstTimestamp, ...fakerTimestamps],
    }

    const { result } = renderHook(() => useShowOutreachPopup(outreachPopupLocalStorage))
    expect(result.current).toEqual(true)
  })

  it('should return true if a frequent user has chosen ask me later and is between the min and max delays', async () => {
    jest.spyOn(useIsSafeOwner, 'default').mockReturnValueOnce(true)
    jest.spyOn(useSafeAddress, 'default').mockReturnValueOnce('0x5Cd167cd2D246B19834726904FA3247362182f6F')
    jest.spyOn(store, 'useAppSelector').mockReturnValueOnce({ open: false })

    const now = Date.now()
    const firstTimestamp = Date.now() - 3 * 24 * 60 * 60 * 1000 // 3 days
    const fakerTimestamps = faker.date
      .betweens({ from: firstTimestamp, to: now, count: 15 }) // 15 visits
      .map((date) => date.getTime())

    const outreachPopupLocalStorage = {
      isClosed: false,
      askAgainLater: true,
      activityTimestamps: [firstTimestamp, ...fakerTimestamps],
    }

    const { result } = renderHook(() => useShowOutreachPopup(outreachPopupLocalStorage))
    expect(result.current).toEqual(true)
  })

  it('should return false if a non frequent user has chosen ask me later and is between the min and max delays', async () => {
    jest.spyOn(useIsSafeOwner, 'default').mockReturnValueOnce(true)
    jest.spyOn(useSafeAddress, 'default').mockReturnValueOnce('0x5Cd167cd2D246B19834726904FA3247362182f6F')
    jest.spyOn(store, 'useAppSelector').mockReturnValueOnce({ open: false })

    const now = Date.now()
    const firstTimestamp = Date.now() - 3 * 24 * 60 * 60 * 1000 // 3 days
    const fakerTimestamps = faker.date
      .betweens({ from: firstTimestamp, to: now, count: 3 }) // 3 visits
      .map((date) => date.getTime())

    const outreachPopupLocalStorage = {
      isClosed: false,
      askAgainLater: true,
      activityTimestamps: [firstTimestamp, ...fakerTimestamps],
    }

    const { result } = renderHook(() => useShowOutreachPopup(outreachPopupLocalStorage))
    expect(result.current).toEqual(false)
  })
})
