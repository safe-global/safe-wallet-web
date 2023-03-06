import { TEST_SAFE, BROWSER_PERMISSIONS_KEY, INFO_MODAL_KEY } from './constants'

describe('The Safe Apps info modal', () => {
  before(() => {
    cy.visit(`/${TEST_SAFE}/apps`, { failOnStatusCode: false })
    cy.findByText(/accept selection/i).click()
  })

  describe('when opening a Safe App', () => {
    it('should show the disclaimer', () => {
      cy.findByRole('link', { name: /logo.*walletconnect/i }).click()
      cy.findByRole('link', { name: /open app/i }).click()
      cy.findByRole('heading', { name: /disclaimer/i }).should('exist')
    })

    it('should show the permissions slide if the app require permissions', () => {
      cy.findByRole('button', { name: /continue/i }).click()
      cy.wait(500) // wait for the animation to finish
      cy.findByRole('checkbox', { name: /camera/i }).should('exist')
    })

    it('should store the permissions and consents decision when accepted', () => {
      cy.findByRole('button', { name: /continue/i })
        .click()
        .should(() => {
          const storedBrowserPermissions = JSON.parse(localStorage.getItem(BROWSER_PERMISSIONS_KEY))
          const browserPermissions = Object.values(storedBrowserPermissions)[0][0]
          const storedInfoModal = JSON.parse(localStorage.getItem(INFO_MODAL_KEY))

          expect(browserPermissions.feature).to.eq('camera')
          expect(browserPermissions.status).to.eq('granted')
          expect(storedInfoModal['5'].consentsAccepted).to.eq(true)
        })
    })
  })
})
