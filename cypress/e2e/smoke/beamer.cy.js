import * as constants from '../../support/constants'
import * as addressbook from '../pages/address_book.page'
import * as main from '../../e2e/pages/main.page'

describe('Beamer', () => {
  before(() => {
    cy.clearLocalStorage()
    cy.visit(constants.addressBookUrl + constants.GOERLI_TEST_SAFE)
    main.acceptCookies()
  })

  it.skip('should require accept "Updates" cookies to display Beamer', () => {
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
