import * as constants from '../../support/constants.js'
import * as main from '../pages/main.page.js'
import * as sideBar from '../pages/sidebar.pages.js'
import * as ls from '../../support/localstorage_data.js'
import { getSafes, CATEGORIES } from '../../support/safes/safesHandler.js'
import * as wallet from '../../support/utils/wallet.js'
import * as create_wallet from '../pages/create_wallet.pages.js'

let staticSafes = []

const walletCredentials = JSON.parse(Cypress.env('CYPRESS_WALLET_CREDENTIALS'))
const signer = walletCredentials.OWNER_4_PRIVATE_KEY

describe('[PROD] Multichain add network tests', () => {
  before(async () => {
    staticSafes = await getSafes(CATEGORIES.static)
  })

  // TODO: Unskip after next release
  it.skip('Verify that zkSync network is not available as add network option for safes from other networks', () => {
    cy.visit(constants.prodbaseUrl + constants.setupUrl + staticSafes.SEP_STATIC_SAFE_4)
    wallet.connectSigner(signer)
    sideBar.openSidebar()
    sideBar.clickOnSafeItemOptionsBtnByIndex(0)
    sideBar.clickOnAddNetworkBtn()
    sideBar.clickOnNetworkInput()
    sideBar.getNetworkOptions().contains(constants.networks.zkSync).parent().should('include', 'Not available')
  })

  // Limitation: zkSync network does not support private key. Test might be flaky.
  it('Verify that it is not possible to add networks for the zkSync safes', () => {
    cy.visit(constants.prodbaseUrl + constants.setupUrl + staticSafes.SEP_STATIC_SAFE_4)
    wallet.connectSigner(signer)
    cy.visit(constants.prodbaseUrl + constants.setupUrl + staticSafes.ZKSYNC_STATIC_SAFE_29)
    sideBar.openSidebar()
    create_wallet.openNetworkSelector()
    cy.contains(sideBar.addingNetworkNotPossibleStr)
  })
})
