import * as constants from '../../support/constants'

describe('The Browser permissions system', () => {
  describe('When the safe app requires permissions', () => {
    beforeEach(() => {
      cy.fixture('safe-app').then((html) => {
        cy.intercept('GET', `${constants.appUrlProd}/*`, html)
        cy.intercept('GET', `*/manifest.json`, {
          name: 'Cypress Test App',
          description: 'Cypress Test App Description',
          icons: [{ src: 'logo.svg', sizes: 'any', type: 'image/svg+xml' }],
          safe_apps_permissions: ['camera', 'microphone'],
        })
      })
    })

    it('should show a permissions slide to the user', () => {
      cy.visitSafeApp(`${constants.appUrlProd}/app`)

      cy.findByRole('checkbox', { name: /camera/i }).should('exist')
      cy.findByRole('checkbox', { name: /microphone/i }).should('exist')
    })

    it('should allow to change, accept and store the selection', () => {
      cy.findByText(/accept selection/i).click()

      cy.findByRole('checkbox', { name: /microphone/i }).click()
      cy.findByRole('button', { name: /continue/i })
        .click()
        .should(() => {
          expect(window.localStorage.getItem(constants.BROWSER_PERMISSIONS_KEY)).to.eq(
            '{"https://safe-test-app.com":[{"feature":"camera","status":"granted"},{"feature":"microphone","status":"denied"}]}',
          )
        })
    })
  })
})
