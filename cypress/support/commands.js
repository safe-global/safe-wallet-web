Cypress.Commands.add('connectE2EWallet', () => {
  cy.on('window:before:load', (window) => {
    // Does not work unless `JSON.stringify` is used
    window.localStorage.setItem('SAFE_v2__lastWallet', JSON.stringify('E2E Wallet'))
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
