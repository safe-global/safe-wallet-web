import * as constants from '../../support/constants'
import * as main from '../pages/main.page'
import * as safeapps from '../pages/safeapps.pages'

describe('Preview drawer tests', () => {
  beforeEach(() => {
    cy.clearLocalStorage()
    cy.visit(`${constants.appsUrl}?safe=${constants.SEPOLIA_TEST_SAFE_5}`, {
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
