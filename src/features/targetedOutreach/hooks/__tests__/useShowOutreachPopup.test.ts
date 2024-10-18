import { renderHook } from '@testing-library/react'
import { useShowOutreachPopup } from '../useShowOutreachPopup'
import * as useIsSafeOwner from '@/hooks/useIsSafeOwner'
import * as useSafeAddress from '@/hooks/useSafeAddress'
import * as store from '@/store'
import { HOUR_IN_MS } from '../../constants'

jest.mock('@/hooks/useIsSafeOwner')
jest.mock('@/hooks/useSafeAddress')
jest.mock('@/store')

describe('useShowOutreachPopup', () => {
  it('should return false when the cookie banner is open', async () => {
    jest.spyOn(useIsSafeOwner, 'default').mockReturnValueOnce(true)
    jest.spyOn(useSafeAddress, 'default').mockReturnValueOnce('0x5Cd167cd2D246B19834726904FA3247362182f6F')
    jest.spyOn(store, 'useAppSelector').mockReturnValueOnce({ open: true }) // mock cookie banner state

    const { result } = renderHook(() => useShowOutreachPopup(false, undefined))
    expect(result.current).toEqual(false)
  })

  it('should return true for signers of targeted safes', async () => {
    jest.spyOn(useIsSafeOwner, 'default').mockReturnValueOnce(true)
    jest.spyOn(useSafeAddress, 'default').mockReturnValueOnce('0x5Cd167cd2D246B19834726904FA3247362182f6F')
    jest.spyOn(store, 'useAppSelector').mockReturnValueOnce({ open: false })

    const { result } = renderHook(() => useShowOutreachPopup(false, undefined))
    expect(result.current).toEqual(true)
  })

  it('should return false if a targeted user has previously closed the popup', async () => {
    jest.spyOn(useIsSafeOwner, 'default').mockReturnValueOnce(true)
    jest.spyOn(useSafeAddress, 'default').mockReturnValueOnce('0x5Cd167cd2D246B19834726904FA3247362182f6F')
    jest.spyOn(store, 'useAppSelector').mockReturnValueOnce({ open: false })

    const { result } = renderHook(() => useShowOutreachPopup(true, undefined))
    expect(result.current).toEqual(false)
  })

  it('should return false if the user has chosen ask me later within the same session and before the maximum delay', async () => {
    jest.spyOn(useIsSafeOwner, 'default').mockReturnValueOnce(true)
    jest.spyOn(useSafeAddress, 'default').mockReturnValueOnce('0x5Cd167cd2D246B19834726904FA3247362182f6F')
    jest.spyOn(store, 'useAppSelector').mockReturnValueOnce({ open: false })

    const { result } = renderHook(() => useShowOutreachPopup(false, Date.now() - HOUR_IN_MS * 2))
    expect(result.current).toEqual(false)
  })

  it('should return true if the user has chosen ask me later within the same session but after the maximum delay of 24 hours', async () => {
    jest.spyOn(useIsSafeOwner, 'default').mockReturnValueOnce(true)
    jest.spyOn(useSafeAddress, 'default').mockReturnValueOnce('0x5Cd167cd2D246B19834726904FA3247362182f6F')
    jest.spyOn(store, 'useAppSelector').mockReturnValueOnce({ open: false })

    const { result } = renderHook(() => useShowOutreachPopup(false, Date.now() - HOUR_IN_MS * 25))
    expect(result.current).toEqual(true)
  })
})
