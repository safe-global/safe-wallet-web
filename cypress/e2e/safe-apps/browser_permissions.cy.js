import * as constants from '../../support/constants'
import * as main from '../pages/main.page'
import * as safeapps from '../pages/safeapps.pages'

describe('The Browser permissions system', () => {
  describe('When the safe app requires permissions', () => {
    beforeEach(() => {
      cy.clearLocalStorage()
      cy.fixture('safe-app').then((html) => {
        cy.intercept('GET', `${constants.testAppUrl}/*`, html)
        cy.intercept('GET', `*/manifest.json`, {
          name: constants.testAppData.name,
          description: constants.testAppData.descr,
          icons: [{ src: 'logo.svg', sizes: 'any', type: 'image/svg+xml' }],
          safe_apps_permissions: ['camera', 'microphone'],
        })
      })
    })

    it('should show a permissions slide to the user', () => {
      cy.visitSafeApp(`${constants.testAppUrl}/app`)
      safeapps.verifyCameraCheckBoxExists()
      safeapps.verifyMicrofoneCheckBoxExists()
    })

    it('should allow to change, accept and store the selection', () => {
      main.acceptCookies()
      safeapps.verifyMicrofoneCheckBoxExists().click()

      safeapps.clickOnContinueBtn().should(() => {
        expect(window.localStorage.getItem(constants.BROWSER_PERMISSIONS_KEY)).to.eq(safeapps.localStorageItem)
      })
    })
  })
})
