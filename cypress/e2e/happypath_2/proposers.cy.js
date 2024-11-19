import * as constants from '../../support/constants.js'
import * as owner from '../pages/owners.pages.js'
import { getSafes, CATEGORIES } from '../../support/safes/safesHandler.js'
import * as wallet from '../../support/utils/wallet.js'
import * as navigation from '../pages/navigation.page.js'
import * as proposer from '../pages/proposers.pages.js'

let staticSafes = []
const walletCredentials = JSON.parse(Cypress.env('CYPRESS_WALLET_CREDENTIALS'))
const signer = walletCredentials.OWNER_4_PRIVATE_KEY
const signer3 = walletCredentials.OWNER_3_PRIVATE_KEY
const proposerAddress = 'sep:0xC16D...6fED'
const proposerAddress2 = '0x8eeC...2a3b'
const proposerName2 = 'Proposer 2'
const changedProposerName = 'Changed proposer name'

describe('Happy path Proposers tests', () => {
  before(async () => {
    staticSafes = await getSafes(CATEGORIES.static)
  })

  beforeEach(() => {
    cy.visit(constants.setupUrl + staticSafes.SEP_STATIC_SAFE_31)
    cy.contains(owner.safeAccountNonceStr, { timeout: 10000 })
    wallet.connectSigner(signer)
  })

  it('Verify that editing a proposer is only possible for the proposer created by the creator', () => {
    navigation.clickOnWalletExpandMoreIcon()
    navigation.clickOnDisconnectBtn()
    wallet.connectSigner(signer3)
    proposer.verifyEditProposerBtnDisabled(proposerAddress)

    proposer.clickOnEditProposerBtn(proposerAddress2)
    proposer.enterProposerName(changedProposerName)
    proposer.clickOnSubmitProposerBtn()
    proposer.checkProposerData(0, [changedProposerName])

    proposer.clickOnEditProposerBtn(proposerAddress2)
    proposer.enterProposerName(proposerName2)
    proposer.clickOnSubmitProposerBtn()
    proposer.checkProposerData(0, [proposerName2])
  })
})
