import { logError, Errors } from '@/services/exceptions'

class Cookies {
  public get(key: string): unknown | undefined {
    if (typeof window === 'undefined') {
      return
    }
    const name = `${encodeURIComponent(key)}=`

    const startIndex = document.cookie.indexOf(name)

    if (startIndex === -1) {
      return undefined
    }

    let endIndex = document.cookie.indexOf(';', startIndex)

    if (endIndex === -1) {
      endIndex = document.cookie.length
    }

    const value = decodeURIComponent(document.cookie.substring(startIndex + name.length, endIndex))

    try {
      return JSON.parse(value)
    } catch (err) {
      logError(Errors._703, `Cookie ${key} - ${(err as Error).message}`)
      return undefined
    }
  }

  public set<T>(
    key: string,
    value: string | T,
    options?: { expires?: Date; path?: string; domain?: string; secure?: boolean },
  ): void {
    const data = JSON.stringify(value)

    let cookie = `${encodeURIComponent(key)}=${encodeURIComponent(data)}`

    if (options?.expires) {
      cookie += `; expires=${options.expires.toUTCString()}`
    }

    if (options?.path) {
      cookie += `; path=${options.path}`
    }

    if (options?.domain) {
      cookie += `; domain=${options.domain}`
    }

    if (options?.secure) {
      cookie += '; secure'
    }

    document.cookie = cookie
  }

  public remove(name: string): void {
    this.set(name, '', { expires: new Date(0) })
  }
}

const cookies = new Cookies()

export default cookies
