'use strict';
var Drivex = require('../');
var webdriver = require('selenium-webdriver');
var By = webdriver.By;
var until = webdriver.until;

var driver = new webdriver.Builder()
  .forBrowser('chrome')
  .build();
function by(locator) {
  return By[locator.type](locator.locator);
}
var drivex = Drivex(driver, webdriver);
driver.get('http://www.google.com/ncr');
//drivex.visible(by({'locator': 'blerg', 'type': 'css'}));
drivex.find(by({'locator': 'q', 'type': 'name'})).sendKeys('webdriver');
drivex.find(by({'locator': 'btnG', 'type': 'name'})).click();
drivex.waitForElementVisible(by({'locator': 'btnG', 'type': 'name'}), 6000, 'didnt find it');

drivex.waitForElementVisible(by({'locator': 'Selenium WebDriver', 'type': 'linkText'}), 6000, 'didnt find it');
drivex.waitForElementVisible(by({'locator': 'notfound', 'type': 'linkText'}), 6000).then(function () { 
  throw new Error("This should have failed");
}, function (err) {
  console.log("got expected error", err);
});
drivex.present(by({'locator': 'notfound', 'type': 'linkText'})).then(function (present) { 
  if (present) {
  	throw new Error("This should not have been present");
  }
  console.log('drivex.present returned %s as expected', present);
}, function (err) {
  console.log('shouldnt have gone to the error handler');
  throw err;
});
//driver.wait(until.titleIs('webdriver - Google Search'), 1000).then(function() {console.log('received correct page title')});
driver.quit();
