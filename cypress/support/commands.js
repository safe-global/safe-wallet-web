Cypress.Commands.add('connectE2EWallet', () => {
  cy.on('window:before:load', (window) => {
    // Does not work unless `JSON.stringify` is used
    window.localStorage.setItem('SAFE_v2__lastWallet', JSON.stringify('E2E Wallet'))
  })
})

Cypress.Commands.add('useProdCGW', () => {
  cy.on('window:before:load', (window) => {
    window.localStorage.setItem('SAFE_v2__debugProdCgw', JSON.stringify(true))
  })
})

Cypress.Commands.add('disableProdCGW', () => {
  cy.on('window:before:load', (window) => {
    window.localStorage.setItem('SAFE_v2__debugProdCgw', JSON.stringify(false))
  })
})

let LOCAL_STORAGE_MEMORY = {}

Cypress.Commands.add('saveLocalStorageCache', () => {
  Object.keys(localStorage).forEach((key) => {
    LOCAL_STORAGE_MEMORY[key] = localStorage[key]
  })
})

Cypress.Commands.add('restoreLocalStorageCache', () => {
  Object.keys(LOCAL_STORAGE_MEMORY).forEach((key) => {
    localStorage.setItem(key, LOCAL_STORAGE_MEMORY[key])
  })
})

/**
 * Wait for a thing by polling for it
 *
 * @param  {(string|function)} item                  - A jQuery selector string or a function that returns a boolean
 * @param  {object}            [options]             - An options object
 * @param  {number}            [options.timeout=200] - The time between tries in milliseconds
 * @param  {number}            [options.tries=300]   - The amount of times to try before failing
 *
 * @return {Promise}                                 - A Cypress promise, more at https://docs.cypress.io/api/utilities/promise.html
 */
const waitForSelector = (item, options = {}) => {
  if (typeof item !== 'string' && !(item instanceof Function)) {
    throw new Error('Cypress plugin waitForSelector: The first parameter should be a string or a function')
  }

  const defaultSettings = {
    timeout: 200,
    tries: 300,
  }
  const SETTINGS = { ...defaultSettings, ...options }

  const check = (item) => {
    if (typeof item === 'string') {
      return Cypress.$(item).length > 0
    } else {
      return item()
    }
  }

  return new Cypress.Promise((resolve, reject) => {
    let index = 0
    const interval = setInterval(() => {
      if (check(item)) {
        clearInterval(interval)
        resolve()
      }
      if (index > SETTINGS.tries) {
        reject()
      }
      index++
    }, SETTINGS.timeout)
  })
}

Cypress.Commands.add('waitForSelector', waitForSelector)
