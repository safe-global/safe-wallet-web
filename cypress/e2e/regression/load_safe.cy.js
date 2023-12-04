import 'cypress-file-upload'
import * as constants from '../../support/constants'
import * as main from '../pages/main.page'
import * as safe from '../pages/load_safe.pages'
import * as createwallet from '../pages/create_wallet.pages'

const testSafeName = 'Test safe name'
const testOwnerName = 'Test Owner Name'
// TODO
const SAFE_ENS_NAME = 'test20.eth'
const SAFE_ENS_NAME_TRANSLATED = constants.EOA

const EOA_ADDRESS = constants.EOA

const INVALID_ADDRESS_ERROR_MSG = 'Address given is not a valid Safe address'

// TODO
const OWNER_ENS_DEFAULT_NAME = 'test20.eth'
const OWNER_ADDRESS = constants.EOA

describe('Load Safe tests', () => {
  beforeEach(() => {
    cy.clearLocalStorage()
    cy.visit(constants.loadNewSafeSepoliaUrl)
    main.acceptCookies()
    cy.wait(2000)
  })

  it('Verify custom name in the first owner can be set', () => {
    safe.inputNameAndAddress(testSafeName, constants.SEPOLIA_TEST_SAFE_1)
    safe.clickOnNextBtn()
    createwallet.typeOwnerName(testOwnerName, 0)
    safe.clickOnNextBtn()
  })

  it('Verify Safe and owner names are displayed in the Review step', () => {
    safe.inputNameAndAddress(testSafeName, constants.SEPOLIA_TEST_SAFE_1)
    safe.clickOnNextBtn()
    createwallet.typeOwnerName(testOwnerName, 0)
    safe.clickOnNextBtn()
    safe.verifyDataInReviewSection(testSafeName, testOwnerName)
    safe.clickOnAddBtn()
  })
})
