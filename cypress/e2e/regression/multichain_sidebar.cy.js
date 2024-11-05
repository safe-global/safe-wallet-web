import * as constants from '../../support/constants.js'
import * as main from '../pages/main.page.js'
import * as sideBar from '../pages/sidebar.pages.js'
import * as ls from '../../support/localstorage_data.js'
import { getSafes, CATEGORIES } from '../../support/safes/safesHandler.js'
import * as wallet from '../../support/utils/wallet.js'

let staticSafes = []

const newSafeName = 'Added safe 3'
const addedSafe900 = 'Added safe 900'
const staticSafe200 = 'Added safe 200'

const walletCredentials = JSON.parse(Cypress.env('CYPRESS_WALLET_CREDENTIALS'))
const signer = walletCredentials.OWNER_4_PRIVATE_KEY

describe('Multichain sidebar tests', () => {
  before(async () => {
    staticSafes = await getSafes(CATEGORIES.static)
  })

  beforeEach(() => {
    cy.visit(constants.BALANCE_URL + staticSafes.MATIC_STATIC_SAFE_28)
    cy.wait(2000)
    main.addToLocalStorage(constants.localStorageKeys.SAFE_v2__addedSafes, ls.addedSafes.set5)
    main.addToLocalStorage(constants.localStorageKeys.SAFE_v2__addressBook, ls.addressBookData.multichain)
    wallet.connectSigner(signer)
  })

  it('Verify Rename and Add network options are available for Group of safes', () => {
    sideBar.openSidebar()
    sideBar.clickOnMultichainItemOptionsBtn(0)
    main.verifyElementsIsVisible([sideBar.safeItemOptionsAddChainBtn, sideBar.safeItemOptionsRenameBtn])
  })

  it('Verify Give name and Add network options are available for a deployed safe', () => {
    let safe = main.changeSafeChainName(staticSafes.MATIC_STATIC_SAFE_28, 'sep')
    cy.visit(constants.BALANCE_URL + safe)

    cy.intercept('GET', constants.safeListEndpoint, {
      11155111: [sideBar.sideBarSafes.safe1, sideBar.sideBarSafes.safe2],
    })
    wallet.connectSigner(signer)
    sideBar.openSidebar()
    sideBar.verifySafeGiveNameOptionExists(1)
  })

  it('Verify "Add network" in more options menu for the single safe', () => {
    let safe = main.changeSafeChainName(staticSafes.MATIC_STATIC_SAFE_28, 'sep')
    cy.visit(constants.BALANCE_URL + safe)

    cy.intercept('GET', constants.safeListEndpoint, {
      11155111: [sideBar.sideBarSafes.safe1, sideBar.sideBarSafes.safe2],
    })
    wallet.connectSigner(signer)
    sideBar.openSidebar()
    sideBar.clickOnSafeItemOptionsBtnByIndex(1)
    sideBar.checkAddChainDialogDisplayed()
  })

  it('Verify "Add Networks" option for the group of safes with multi-chain safe', () => {
    wallet.connectSigner(signer)
    sideBar.openSidebar()
    sideBar.clickOnSafeItemOptionsBtnByIndex(0)
    sideBar.checkAddChainDialogDisplayed()
  })

  it('Verify "Add another network" button in safe group', () => {
    wallet.connectSigner(signer)
    sideBar.openSidebar()
    main.verifyElementsExist([sideBar.addNetworkBtn])
  })

  it('Verify there is no Rename option for a safe in the group', () => {
    sideBar.openSidebar()
    sideBar.checkThereIsNoOptionsMenu(0)
  })

  it('Verify Rename option in the group of safes opens a new edit entry modal', () => {
    sideBar.openSidebar()
    sideBar.clickOnMultichainItemOptionsBtn(0)
    sideBar.clickOnRenameBtn()
  })
  it('Verify "Add another network" at the end of the group list', () => {
    sideBar.openSidebar()
    sideBar.checkAddNetworkBtnPosition(0)
  })

  it('Verify balance of the safe group', () => {
    sideBar.openSidebar()
    sideBar.checkSafeGroupBalance(0, '0.24')
  })

  it('Verify address of the safe group', () => {
    const address = '0xC96e...ee3B'
    sideBar.openSidebar()
    sideBar.checkSafeGroupAddress(0, address)
  })

  it('Verify network logo for safes in the group', () => {
    sideBar.openSidebar()
    sideBar.checkSafeGroupIconsExist(0, 3)
  })

  it('Verify tooltip with networks for multichain safe', () => {
    sideBar.openSidebar()
    sideBar.checkMultichainTooltipExists(0)
  })
})
