import * as constants from '../../support/constants'
import * as main from '../pages/main.page'
import * as safeapps from '../pages/safeapps.pages'

const myCustomAppTitle = 'Cypress Test App'
const myCustomAppDescrAdded = 'Cypress Test App Description'

describe('Safe Apps list tests', () => {
  beforeEach(() => {
    cy.clearLocalStorage()
    cy.visit(`${constants.appsUrl}?safe=${constants.SEPOLIA_TEST_SAFE_4}`, {
      failOnStatusCode: false,
    })
    main.acceptCookies()
  })

  it('Verify app list can be filtered by app name', () => {
    // Wait for /safe-apps response
    cy.intercept('GET', constants.appsEndpoint).then(() => {
      safeapps.typeAppName(constants.appNames.walletConnect)
      safeapps.verifyLinkName(safeapps.linkNames.wcLogo)
    })
  })

  it('Verify app list can be filtered by app description', () => {
    safeapps.typeAppName(constants.appNames.customContract)
    safeapps.verifyLinkName(safeapps.linkNames.txBuilderLogo)
  })

  it('Verify error message is displayed when no app found', () => {
    safeapps.typeAppName(constants.appNames.noResults)
    safeapps.verifyNoAppsTextPresent()
  })

  it('Verify apps can be pinned', () => {
    safeapps.clearSearchAppInput()
    safeapps.pinApp(safeapps.transactionBuilderStr)
    safeapps.verifyPinnedAppCount(1)
  })

  it('Verify apps can be unpinned', () => {
    safeapps.pinApp(safeapps.transactionBuilderStr)
    safeapps.pinApp(safeapps.transactionBuilderStr, false)
    safeapps.verifyPinnedAppCount(0)
  })

  it('Verify there is an error when the app manifest is invalid', () => {
    cy.intercept('GET', constants.invalidAppUrl, {
      name: constants.testAppData.name,
    })
    safeapps.clickOnCustomAppsTab()
    safeapps.clickOnAddCustomApp()
    safeapps.typeCustomAppUrl(constants.invalidAppUrl)
    safeapps.verifyAppNotSupportedMsg()
  })

  it('Verify an app can be added to the list within the custom apps section', () => {
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
    safeapps.verifyCustomAppCount(1)
    safeapps.verifyAppDescription(myCustomAppDescrAdded)
  })
})
