import * as constants from '../../support/constants'
import * as main from '../pages/main.page'
import * as safeapps from '../pages/safeapps.pages'

describe('Safe Apps info modal tests', () => {
  before(() => {
    cy.clearLocalStorage()
    cy.visit(`/${constants.SEPOLIA_TEST_SAFE_5}/apps`, { failOnStatusCode: false })
    main.acceptCookies()
  })

  it('Verify the preview drawer is displayed when opening a Safe App from the app list [C56149]', () => {
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
