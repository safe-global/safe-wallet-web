describe('Transactions', () => {
  beforeAll(async () => {
    await device.launchApp()
  })

  beforeEach(async () => {
    await device.reloadReactNative()
  })

  it('should navigate to transactions and be able to scroll', async () => {
    await element(by.id('transactions')).tap()
    await expect(element(by.text('History'))).toBeVisible()
    await element(by.id('tx-history-list')).scroll(500, 'down')
    await element(by.id('tx-history-list')).scroll(500, 'up')
  })
})
