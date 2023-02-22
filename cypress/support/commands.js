Cypress.Commands.add('connectE2EWallet', () => {
  cy.on('window:before:load', (window) => {
    // Does not work unless `JSON.stringify` is used
    window.localStorage.setItem('SAFE_v2__lastWallet', JSON.stringify('MetaMask'))
  })
})
