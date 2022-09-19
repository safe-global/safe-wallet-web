import '@testing-library/cypress/add-commands'

Cypress.Commands.add('connectE2EWallet', () => {
  cy.on('window:before:load', (window) => {
    window.localStorage.setItem(
      'SAFE_v2__lastWallet',
      JSON.stringify({ value: 'E2E Wallet', expiry: new Date().getTime() + 3600 * 1000 * 24 }),
    )
  })
})
