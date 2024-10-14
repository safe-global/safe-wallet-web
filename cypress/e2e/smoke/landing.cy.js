import * as constants from '../../support/constants'
describe('[SMOKE] Landing page tests', () => {
  it('[SMOKE] Verify a user will be redirected to welcome page', () => {
    cy.visit('/')
    cy.url().should('include', constants.welcomeUrl)
  })
})
