const RINKEBY_TEST_SAFE = 'rin:0x11Df0fa87b30080d59eba632570f620e37f2a8f7'
const BROWSER_PERMISSIONS_KEY = 'SAFE_v2__BROWSER_PERMISSIONS'
const INFO_MODAL_KEY = 'SAFE_v2__SAFE_APPS_INFO_MODAL'

describe('Safe Apps Info Modal', () => {
  before(() => {
    cy.visit(`/${RINKEBY_TEST_SAFE}/apps`, { failOnStatusCode: false })
    cy.contains('button', 'Accept selection').click()
  })

  describe('when opening a Safe App', () => {
    it('should show the disclaimer', () => {
      cy.contains('WalletConnect').click()
      cy.contains('Disclaimer').should('be.visible')
    })

    it('should show the permissions slide if the app require permissions', () => {
      cy.contains('button', 'Continue').click()
      cy.wait(500) // wait for the animation to finish
      cy.contains('Camera').should('be.visible')
    })

    it('should store the permissions and consents decision when accepted', () => {
      cy.contains('button', 'Continue')
        .click()
        .should(() => {
          const storedBrowserPermissions = JSON.parse(localStorage.getItem(BROWSER_PERMISSIONS_KEY))
          const browserPermissions = Object.values(storedBrowserPermissions)[0][0]
          const storedInfoModal = JSON.parse(localStorage.getItem(INFO_MODAL_KEY))

          expect(browserPermissions.feature).to.eq('camera')
          expect(browserPermissions.status).to.eq('granted')
          expect(storedInfoModal['4'].consentsAccepted).to.eq(true)
        })
    })
  })
})
