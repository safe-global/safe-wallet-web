import * as constants from '../../support/constants'
import * as dashboard from '../pages/dashboard.pages'
import * as main from '../pages/main.page'

describe('Dashboard tests', () => {
  beforeEach(() => {
    cy.clearLocalStorage()
    cy.visit(constants.BALANCE_URL + constants.SEPOLIA_TEST_SAFE_5)
    main.acceptCookies(2)
    main.clickOnSideMenuItem(constants.mainSideMenuOptions.home)
    dashboard.verifyConnectTransactStrIsVisible()
  })

  it('Verify the overview widget is displayed ', () => {
    dashboard.verifyOverviewWidgetData()
  })

  it('Verify the transaction queue widget is displayed ', () => {
    dashboard.verifyTxQueueWidget()
  })

  it('Verify the featured Safe Apps are displayed ', () => {
    dashboard.verifyFeaturedAppsSection()
  })

  it('Verify the Safe Apps Section is displayed ', () => {
    dashboard.verifySafeAppsSection()
  })
})
