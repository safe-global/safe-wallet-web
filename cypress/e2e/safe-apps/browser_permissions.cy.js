const RINKEBY_TEST_SAFE = 'rin:0x4483bAaB2c2EB667f0541464266a1c1a8778151a'
const appUrl = 'https://safe-test-app.com'

describe('The Browser permissions system', () => {
  describe('When the safe app requires permissions', () => {
    beforeEach(() => {
      cy.fixture('safe-app').then((html) => {
        cy.intercept('GET', `${appUrl}/*`, html)
        cy.intercept('GET', `*/manifest.json`, {
          name: 'Cypress Test App',
          description: 'Cypress Test App Description',
          iconPath: 'http://via.placeholder.com/32',
          safe_apps_permissions: ['camera', 'microphone'],
        })
      })
    })

    it('should show a permissions slide to the user', () => {
      cy.visitSafeApp(`${appUrl}/app`)

      cy.contains('Camera').should('be.visible')
      cy.contains('Microphone').should('be.visible')
    })

    it('should allow to change, accept and store the selection', () => {
      cy.contains('Accept selection').click()

      cy.contains('Microphone').click()
      cy.contains('Continue')
        .click()
        .should(() => {
          expect(window.localStorage.getItem('SAFE_v2__BROWSER_PERMISSIONS')).to.eq(
            '{"https://safe-test-app.com/app":[{"feature":"camera","status":"granted"},{"feature":"microphone","status":"denied"}]}',
          )
        })
    })
  })
})
