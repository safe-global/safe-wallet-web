import * as constants from '../../support/constants'
import * as addressbook from '../pages/address_book.page'
import * as main from '../../e2e/pages/main.page'

describe('Beamer tests', () => {
  before(() => {
    cy.clearLocalStorage()
    cy.visit(constants.addressBookUrl + constants.SEPOLIA_TEST_SAFE_1)
    main.acceptCookies()
  })

  it.skip('Verify "Updates" cookie acceptance is required before displaying Beamer', () => {
    addressbook.clickOnWhatsNewBtn()
    addressbook.acceptBeamerCookies()
    addressbook.verifyBeamerIsChecked()
    main.acceptCookies()
    // wait for Beamer cookies to be set
    cy.wait(1000)
    addressbook.clickOnWhatsNewBtn(true) // clicks through the "lastPostTitle"
    addressbook.verifyBeameriFrameExists()
  })
})
