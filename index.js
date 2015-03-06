var wd = require('selenium-webdriver');
var debug = require('debug');
var log = debug('selenium-drivex');


module.exports = function drivex(driver) {
  var methods = {
    find: function (locator, el) {
      return (el ? el : driver).findElement(locator);
    },
    /**
     * wraps Selenium WebDriver/WebElement.findElements
     * @param locator {LocatorJSON}
     * @param el {WebElement}
     * @returns {Promise} resolves to an array of WebElements or rejected
     */
    finds: function (locator, el) {
      return (el ? el : driver).findElements(locator);
    },
    /**
     * wraps Selenium WebDriver/WebElement.isElementPresent
     * @param locator {LocatorJSON}
     * @param el {WebElement}
     * @returns {Promise} resolves to true or rejected
     */
    present: function (locator, el) {
      return (el ? el : driver).isElementPresent(locator);
    },
    /**
     * wraps Selenium WebElement.isVisible
     * @param locator {LocatorJSON}
     * @param el {WebElement}
     * @returns {Promise} resolves to true or rejected
     */
    visible: function (locator, el) {
      return methods.find(locator, el).then(function(elt) {
        return elt.isDisplayed();
      });
    },
    /**
     * Wait for timeout milliseconds for the WebElement to be present
     * @param locator {LocatorJSON}
     * @param timeout {Number}
     * @param msg {String} optional message for any error messages
     * @returns {Promise} resolves to true or throw error
     */
    waitForElement: function (locator, timeout, msg) {
      log('waitForElement', locator);
      return driver.wait(wd.until.elementLocated(locator), timeout, msg).then(function() {
        log('waitForElement: found', locator);
        return true;
      }, function(err) {
        log('waitForElement', err);
        log(err.stack);
        throw new Error(msg || '[drivex.waitForElement] Element not locatable');
      });
    }
  };
  return methods;
};