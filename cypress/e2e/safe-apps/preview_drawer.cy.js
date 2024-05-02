import * as constants from '../../support/constants'
import * as main from '../pages/main.page'
import * as safeapps from '../pages/safeapps.pages'
import { getSafes, CATEGORIES } from '../../support/safes/safesHandler.js'

let staticSafes = []

describe('Preview drawer tests', () => {
  before(async () => {
    staticSafes = await getSafes(CATEGORIES.static)
  })

  beforeEach(() => {
    cy.clearLocalStorage()
    cy.visit(`${constants.appsUrl}?safe=${staticSafes.SEP_STATIC_SAFE_2}`, {
      failOnStatusCode: false,
    })
    main.acceptCookies()
  })

  it('Verify the preview drawer is displayed when opening a Safe App from the app list', () => {
    safeapps.clickOnApp(safeapps.transactionBuilderStr)

    cy.findByRole('presentation').within(() => {
      safeapps.verifyPreviewWindow(
        safeapps.transactiobUilderHeadlinePreview,
        safeapps.connecttextPreview,
        safeapps.availableNetworksPreview,
      )
      safeapps.closePreviewWindow()
    })
    cy.findByRole('presentation').should('not.exist')
  })
})
