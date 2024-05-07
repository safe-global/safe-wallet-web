import * as constants from '../../support/constants'
import * as addressbook from '../pages/address_book.page'
import * as main from '../../e2e/pages/main.page'
import { getSafes, CATEGORIES } from '../../support/safes/safesHandler.js'

let staticSafes = []

describe('Beamer tests', () => {
  before(async () => {
    staticSafes = await getSafes(CATEGORIES.static)
    cy.clearLocalStorage()
    cy.visit(constants.addressBookUrl + staticSafes.SEP_STATIC_SAFE_4)
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
