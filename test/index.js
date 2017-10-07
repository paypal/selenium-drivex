'use strict';
var Drivex = require('../');
var webdriver = require('selenium-webdriver');
const {Builder, By, promise} = require('selenium-webdriver');

promise.USE_PROMISE_MANAGER = false;

function by(locator) {
  return By[locator.type](locator.locator);
}

(async function test() {
  let driver = await new Builder().forBrowser('phantomjs').build();
  let drivex = Drivex(driver, webdriver);
  await driver.get('http://www.google.com/ncr');
  await drivex.waitForElementVisiblePromise(by({'locator': 'q', 'type': 'name'})).sendKeys('webdriver');
  await drivex.waitForElementVisiblePromise(by({'locator': 'lsb', 'type': 'className'})).click().catch(async (err) => {
    await driver.quit();
    throw err;
  });
  await drivex.waitForElementVisible(by({'locator': 'btnG', 'type': 'name'}), 6000, 'didnt find it');

  await drivex.waitForElementVisible(by({'locator': 'Selenium WebDriver', 'type': 'linkText'}), 6000, 'didnt find it');
  await drivex.waitForElementVisible(by({'locator': 'notfound', 'type': 'linkText'}), 6000).then(function () {
    throw new Error("This should have failed");
  }, function (err) {
    console.log("got expected error", err);
  });
  await drivex.present(by({'locator': 'notfound', 'type': 'linkText'})).then(function (present) {
    if (present) {
      throw new Error("This should not have been present");
    }
    console.log('drivex.present returned %s as expected', present);
  }, function (err) {
    console.log('shouldnt have gone to the error handler');
    throw err;
  });
  await driver.quit();
})();

