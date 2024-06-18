import * as constants from '../../support/constants.js'
import * as main from '../pages/main.page.js'
import * as swaps from '../pages/swaps.pages.js'
import * as assets from '../pages/assets.pages.js'
import { getSafes, CATEGORIES } from '../../support/safes/safesHandler.js'

let staticSafes = []

let iframeSelector = `iframe[src*="${constants.swapWidget}"]`

describe('[SMOKE] Swaps token tests', () => {
  before(async () => {
    staticSafes = await getSafes(CATEGORIES.static)
  })

  beforeEach(() => {
    cy.clearLocalStorage()
    cy.visit(constants.BALANCE_URL + staticSafes.SEP_STATIC_SAFE_1)
    main.acceptCookies()
  })

  it(
    'Verify that clicking the swap from assets tab, autofills that token automatically in the form',
    { defaultCommandTimeout: 30000 },
    () => {
      assets.selectTokenList(assets.tokenListOptions.allTokens)

      swaps.clickOnAssetSwapBtn(0)
      swaps.acceptLegalDisclaimer()
      swaps.waitForOrdersCallToComplete()
      cy.wait(2000)
      main.getIframeBody(iframeSelector).within(() => {
        swaps.verifySelectedInputCurrancy(swaps.swapTokens.eth)
      })
    },
  )

  it('Verify swap button are displayed in assets table and dashboard', () => {
    assets.selectTokenList(assets.tokenListOptions.allTokens)
    main.verifyElementsCount(swaps.assetsSwapBtn, 4)
    cy.visit(constants.homeUrl + staticSafes.SEP_STATIC_SAFE_1)
    main.verifyElementsCount(swaps.assetsSwapBtn, 4)
    main.verifyElementsCount(swaps.dashboardSwapBtn, 1)
  })
})
