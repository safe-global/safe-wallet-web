import * as constants from '../../support/constants'
import * as main from '../pages/main.page'
import * as safeapps from '../pages/safeapps.pages'

const myCustomAppTitle = 'Cypress Test App'
const myCustomAppDescrAdded = 'Cypress Test App Description'

describe('Safe Apps tests', () => {
  beforeEach(() => {
    cy.clearLocalStorage()
    cy.visit(constants.SEPOLIA_TEST_SAFE_4 + constants.appsUrl, { failOnStatusCode: false })
    main.acceptCookies()
  })

  it('Verify app list can be filtered by app name [C56130]', () => {
    // Wait for /safe-apps response
    cy.intercept('GET', constants.appsEndpoint).then(() => {
      safeapps.typeAppName(constants.appNames.walletConnect)
      safeapps.verifyLinkName(safeapps.linkNames.logo)
    })
  })

  it('Verify app list can be filtered by app description [C56131]', () => {
    safeapps.typeAppName(constants.appNames.customContract)
    safeapps.verifyLinkName(safeapps.linkNames.logo)
  })

  it('Verify error message is displayed when no app found [C56132]', () => {
    safeapps.typeAppName(constants.appNames.noResults)
    safeapps.verifyNoAppsTextPresent()
  })

  it('Verify apps can be pinned [C56133]', () => {
    safeapps.clearSearchAppInput()
    safeapps.pinApp(safeapps.pinWalletConnectStr)
    safeapps.pinApp(safeapps.transactionBuilderStr)
    safeapps.clickOnBookmarkedAppsTab()
    safeapps.verifyAppCount(2)
  })

  it('Verify apps can be unpinned [C56134]', () => {
    safeapps.pinApp(safeapps.pinWalletConnectStr)
    safeapps.pinApp(safeapps.transactionBuilderStr)
    safeapps.pinApp(safeapps.pinWalletConnectStr, false)
    safeapps.pinApp(safeapps.transactionBuilderStr, false)
    safeapps.clickOnBookmarkedAppsTab()
    safeapps.verifyAppCount(0)
  })

  it('Verify there is an error when the app manifest is invalid [C56135]', () => {
    cy.intercept('GET', constants.invalidAppUrl, {
      name: constants.testAppData.name,
    })
    safeapps.clickOnCustomAppsTab()
    safeapps.clickOnAddCustomApp()
    safeapps.typeCustomAppUrl(constants.invalidAppUrl)
    safeapps.verifyAppNotSupportedMsg()
  })

  it('Verify an app can be added to the list within the custom apps section [C56136]', () => {
    cy.intercept('GET', constants.validAppUrlJson, {
      name: constants.testAppData.name,
      description: constants.testAppData.descr,
      icons: [{ src: 'logo.svg', sizes: 'any', type: 'image/svg+xml' }],
    })

    safeapps.clickOnCustomAppsTab()
    safeapps.clickOnAddCustomApp()
    safeapps.typeCustomAppUrl(constants.validAppUrl)
    safeapps.verifyAppTitle(myCustomAppTitle)
    safeapps.acceptTC()
    safeapps.clickOnAddBtn()
    safeapps.verifyAppCount(1)
    safeapps.verifyAppDescription(myCustomAppDescrAdded)
  })
})
