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
drivex.find(by({'locator': 'q', 'type': 'name'})).sendKeys('webdriver');
drivex.find(by({'locator': 'btnG', 'type': 'name'})).click();
driver.wait(until.titleIs('webdriver - Google Search'), 1000).then(function() {console.log('received correct page title')});
driver.quit();
