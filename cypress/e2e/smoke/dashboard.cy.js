import * as constants from '../../support/constants'
import * as dashboard from '../pages/dashboard.pages'
import * as main from '../pages/main.page'

describe('[SMOKE] Dashboard tests', () => {
  beforeEach(() => {
    cy.clearLocalStorage()
    cy.visit(constants.BALANCE_URL + constants.SEPOLIA_TEST_SAFE_5)
    main.acceptCookies()
    main.clickOnSideMenuItem(constants.mainSideMenuOptions.home)
    dashboard.verifyConnectTransactStrIsVisible()
  })

  it('[SMOKE] Verify the overview widget is displayed', () => {
    dashboard.verifyOverviewWidgetData()
  })

  it('[SMOKE] Verify the transaction queue widget is displayed', () => {
    dashboard.verifyTxQueueWidget()
  })

  it('[SMOKE] Verify the featured Safe Apps are displayed', () => {
    dashboard.verifyFeaturedAppsSection()
  })

  it('[SMOKE] Verify the Safe Apps Section is displayed', () => {
    dashboard.verifySafeAppsSection()
  })
})
