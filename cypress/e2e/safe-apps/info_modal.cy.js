import * as constants from '../../support/constants'
import * as main from '../pages/main.page'
import * as safeapps from '../pages/safeapps.pages'

describe('The Safe Apps info modal', () => {
  before(() => {
    cy.clearLocalStorage()
    cy.visit(constants.TEST_SAFE_2 + constants.appsUrl, { failOnStatusCode: false })
    main.acceptCookies()
  })

  describe('when opening a Safe App', () => {
    it('should show the disclaimer', () => {
      safeapps.clickOnApp(safeapps.logoWalletConnect)
      safeapps.clickOnOpenSafeAppBtn()
    })

    it('should show the permissions slide if the app require permissions', () => {
      safeapps.clickOnContinueBtn()
      cy.wait(500) // wait for the animation to finish
      safeapps.verifyCameraCheckBoxExists()
    })

    it('should store the permissions and consents decision when accepted', () => {
      safeapps.storeAndVerifyPermissions()
    })
  })
})
