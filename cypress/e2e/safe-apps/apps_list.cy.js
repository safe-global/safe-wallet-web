import * as constants from '../../support/constants'
import * as main from '../pages/main.page'
import * as safeapps from '../pages/safeapps.pages'

const myCustomAppTitle = 'Cypress Test App'
const myCustomAppDescrAdded = 'Cypress Test App Description'

describe('The Safe Apps list', () => {
  before(() => {
    cy.clearLocalStorage()
    cy.visit(constants.TEST_SAFE_2 + constants.appsUrl, { failOnStatusCode: false })
    main.acceptCookies()
  })

  describe('When searching apps', () => {
    it('should filter the list by app name', () => {
      // Wait for /safe-apps response
      cy.intercept('GET', constants.appsEndpoint).then(() => {
        safeapps.typeAppName(constants.appNames.walletConnect)
        safeapps.verifyLinkName(safeapps.linkNames.logo)
      })
    })

    it('should filter the list by app description', () => {
      safeapps.typeAppName(constants.appNames.customContract)
      safeapps.verifyLinkName(safeapps.linkNames.logo)
    })

    it('should show a not found text when no match', () => {
      safeapps.typeAppName(constants.appNames.noResults)
      safeapps.verifyNoAppsTextPresent()
    })
  })

  describe('When browsing the apps list', () => {
    it('should allow to pin apps', () => {
      safeapps.clearSearchAppInput()
      safeapps.pinApp(safeapps.pinWalletConnectStr)
      safeapps.pinApp(safeapps.transactionBuilderStr)
      safeapps.clickOnBookmarkedAppsTab()
      safeapps.verifyAppCount(2)
    })

    it('should allow to unpin apps', () => {
      safeapps.pinApp(safeapps.pinWalletConnectStr)
      safeapps.pinApp(safeapps.transactionBuilderStr)
      safeapps.verifyAppCount(0)
    })
  })

  describe('When adding a custom app', () => {
    it('should show an error when the app manifest is invalid', () => {
      cy.intercept('GET', constants.invalidAppUrl, {
        name: constants.testAppData.name,
      })
      safeapps.clickOnCustomAppsTab()
      safeapps.clickOnAddCustomApp()
      safeapps.typeCustomAppUrl(constants.invalidAppUrl)
      safeapps.verifyAppNotSupportedMsg()
    })

    it('should be added to the list within the custom apps section', () => {
      cy.intercept('GET', constants.validAppUrlJson, {
        name: constants.testAppData.name,
        description: constants.testAppData.descr,
        icons: [{ src: 'logo.svg', sizes: 'any', type: 'image/svg+xml' }],
      })

      safeapps.typeCustomAppUrl(constants.validAppUrl)
      safeapps.verifyAppTitle(myCustomAppTitle)
      safeapps.acceptTC()
      safeapps.clickOnAddBtn()
      safeapps.verifyAppCount(1)
      safeapps.verifyAppDescription(myCustomAppDescrAdded)
    })
  })
})
