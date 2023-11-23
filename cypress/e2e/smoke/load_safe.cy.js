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

describe('[SMOKE] Load Safe tests', () => {
  beforeEach(() => {
    cy.clearLocalStorage()
    cy.visit(constants.loadNewSafeSepoliaUrl)
    main.acceptCookies()
    cy.wait(2000)
  })

  it('[SMOKE] Verify the custom Safe name is successfully loaded', () => {
    safe.inputNameAndAddress(testSafeName, constants.SEPOLIA_TEST_SAFE_2)
    safe.clickOnNextBtn()
    createwallet.typeOwnerName(testOwnerName, 0)
    safe.clickOnNextBtn()
    safe.verifyDataInReviewSection(testSafeName, testOwnerName)
    safe.clickOnAddBtn()
    main.verifyHomeSafeUrl(constants.SEPOLIA_TEST_SAFE_2)
    safe.veriySidebarSafeNameIsVisible(testSafeName)
    safe.verifyOwnerNamePresentInSettings(testOwnerName)
  })
})
