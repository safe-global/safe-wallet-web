describe('Example', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should have welcome screen', async () => {
    await expect(element(by.id('welcome-title'))).toBeVisible();
  });

  it('should show hello screen after tap', async () => {
    await element(by.text('Explore')).tap();
    await expect(element(by.id('explore-title'))).toBeVisible();
  });
});
