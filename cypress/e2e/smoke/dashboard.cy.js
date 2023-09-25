import * as constants from '../../support/constants'
import * as dashboard from '../pages/dashboard.pages'
import * as main from '../pages/main.page'

describe('Dashboard', () => {
  before(() => {
    cy.clearLocalStorage()
    cy.visit(constants.homeUrl + constants.TEST_SAFE)
    main.acceptCookies()
    dashboard.verifyConnectTransactStrIsVisible()
  })

  it('should display the overview widget', () => {
    dashboard.verifyOverviewWidgetData()
  })

  it('should display the tx queue widget', () => {
    dashboard.verifyTxQueueWidget()
  })

  it('should display the featured Safe Apps', () => {
    dashboard.verifyFeaturedAppsSection()
  })

  it('should show the Safe Apps Section', () => {
    dashboard.verifySafeAppsSection()
  })
})
