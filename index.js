var log = require('debug')('selenium-drivex');
var async = require('async');
function p(wd) {
  //return a nodejs promise or webdriver promise
  var promiz;
  var wdPromiz = wd.promise.defer();
  var fulfill = function (n) {
    wdPromiz.fulfill(n);
  };
  var reject = function (err) {
    wdPromiz.reject(err);
  };
  promiz = (global.Promise) ? new Promise(function (good, bad) {
    fulfill = good;
    reject = bad;
  }) : wdPromiz.promise;
  return {promise: promiz, fulfill, reject};
};

module.exports = function drivex(driver, wd) {
  var methods = {
    find: function (locator, el) {
      log('finds:start %s', locator);
      return (el ? el : driver).findElement(locator);
    },
    /**
     * wraps Selenium WebDriver/WebElement.findElements
     * @param locator {LocatorJSON}
     * @param el {WebElement}
     * @returns {Promise} resolves to an array of WebElements or []
     */
    finds: function (locator, el) {
      log('finds:start %s', locator);
      return (el ? el : driver).findElements(locator);
    },
    /**
     * wraps Selenium WebDriver/WebElement.findElements
     * @param locator {LocatorJSON}
     * @param el {WebElement}
     * @returns {Promise} resolves to true or false
     */
    present: function (locator, el) {
      log('present:start %s', locator);
      return (el ? el : driver).findElements(locator).then(function (elts) {
        log('present:success %s', locator);
        return elts.length > 0
      });
    },
    /**
     * wraps Selenium WebElement.isVisible
     * @param locator {LocatorJSON}
     * @param el {WebElement}
     * @returns {Promise} resolves to true or rejected
     */
    visible: function (locator, el) {
      log('visible:start %s', locator);
      return methods.find(locator, el).then(function (elt) {
        log('visible:success %s', locator);
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
      log('waitForElement:start %s', locator);
      return driver.wait(wd.until.elementLocated(locator), timeout, msg).then(function () {
        log('waitForElement:found %s', locator);
        return methods.find(locator);
      }, function (err) {
        log('waitForElement %s', err);
        log(err.stack);
        throw new Error(msg || '[drivex.waitForElement] Element not locatable for locator ' + showLocator(locator));
      });
    },
    /**
     * Wait for timeout milliseconds for the WebElement to be present
     * @param locator {LocatorJSON}
     * @param timeout {Number}
     * @param msg {String} optional message for any error messages
     * @returns {WebElementPromise} resolves to WebElement or throw error
     */
    waitForElementPromise: function (locator, timeout, msg) {
      log('waitForElementPromise:start %s', locator);
      function waitReturnElement() {
        log('waitForElementPromise>waitReturnElement:start %s', locator);
        return methods.waitForElement(locator, timeout || 5000, msg);
      }

      var wep = new wd.WebElementPromise(driver, waitReturnElement());
      return wep;
    },
    /**
     * Wait for timeout milliseconds for the WebElement to be visible
     * @param locator {LocatorJSON}
     * @param timeout {Number}
     * @param msg {String} optional message for any error messages
     * @returns {Promise} resolves to true or throw error
     */
    waitForElementVisible: function (locator, timeout, msg) {

      log('waitForElementVisible:start %s', locator);
      // return driver.sleep(10).then(function () {
      return driver.wait(function () {
        log('waitForElementVisible:present %s', locator);
        return methods.present(locator);
      }, timeout, msg).then(function () {
        return driver.wait(function () {
          log('waitForElementVisible:visible %s', locator);
          return methods.visible(locator);
        }, timeout, msg)
        // })
      }).then(function (isVisible) {
        log('waitForElementVisible:find %s, isVisible %s ', locator, isVisible);
        return methods.find(locator);
      }, function (err) {
        log('waitForElementVisible:err %s', err);
        throw new Error(msg || `[drivex.waitForElementVisible] Element not visible ${locator}`);
      });
    },
    /**
     * Wait for timeout milliseconds for the WebElement to be visible
     * @param locator {LocatorJSON}
     * @param timeout {Number}
     * @param msg {String} optional message for any error messages
     * @returns {WebElementPromise} resolves to WebElement or throw error
     */
    waitForElementVisiblePromise: function (locator, timeout, msg) {
      log('waitForElementVisiblePromise:start %s', locator);
      function waitVisibleReturnElement() {
        log('waitForElementVisiblePromise>waitVisibleReturnElement:start %s', locator);
        return methods.waitForElementVisible(locator, timeout || 5000, msg);
      }

      var wep = new wd.WebElementPromise(driver, waitVisibleReturnElement());
      return wep;
    },
    /**
     *
     * @param locator MUST resolve to a SELECT element
     * @param optionText option text to select
     * @param parentWebElement (optional)
     * @returns {Promise} resolves to a WebeElement.click() (which resolves itself to a Promise
     */
    selectByOptionText: function (locator, optionText, parentWebElement) {
      var d = p(wd);
      log('selectByOptionText:start, locator:%s, text: %s', locator, optionText);
      methods.find(locator, parentWebElement).then(function (selectEl) {
        selectEl.findElements(wd.By.css('option')).then(function (elts) {
          var current = 0;
          var total = elts.length;
          var found = false;
          async.whilst(
            function () {
              return current < total;
            },
            function (callback) {
              var elt = elts[current++];
              elt.getText().then(function (txt) {
                if (txt === optionText) {
                  found = elt;
                }
                callback();
              });
            },
            function (err) {
              if (found !== false) {
                d.fulfill(found.click());
              } else {
                d.reject(new Error('[drivex.selectByOptionText] couldn\'t find option with text: ' + JSON.stringify(optionText) + ' for locator ' + showLocator(locator)));
              }
            }
          );
        });
      });
      return d.promise;
    },
    /**
     *
     * @param locator MUST resolve to a SELECT element
     * @param optionValue option attribute value to select
     * @param parentWebElement (optional)
     * @returns {Promise} resolves to a WebeElement.click() (which resolves itself to a Promise
     */
    selectByOptionValue: function (locator, optionValue, parentWebElement) {
      log('selectByOptionValue:start, locator:%s, value: %s', locator, optionValue);
      return methods.find(locator, parentWebElement).then(function (selectEl) {
        return selectEl.findElement(wd.By.css('option[value=\'' + optionValue + '\']')).then(function (element) {
          return element.click();
        }, function (err) {
          throw new Error(err);
        });
      }, function (err) {
        throw new Error(err);
      });
    },
    /**
     *
     * @param locatorObject {'key1': LocatorObj, 'key2': LocatorObj, ...}
     * @param timeout (optional)
     * @returns {*}
     */
    firstVisible: function (locatorObject, timeout) {
      var keyFound;
      var elementTests = [];
      log('firstVisible:start, locatorObject:%o', locatorObject);
      Object.keys(locatorObject).forEach(function (key) {
        var loc = locatorObject[key];
        elementTests.push(function () {
          return methods.waitForElementVisible(loc, 100).then(function () {
            keyFound = key;
            return true;
          }, function (err) {
            return false;
          });
        });
      });
      return driver.wait(function () {
        var elementTest = elementTests.shift();
        elementTests.push(elementTest);
        return elementTest();
      }, timeout || 5000).then(function () {
        return keyFound;
      });
    },
    /**
     *validateText validates the text for a WebElement
     * @param locator
     * @param parentWebElement (optional)
     * @param expected text
     * @returns {WebElementPromise} resolves to true or throw error
     */
    validateText: function (locator, parentWebElement, expectedText) {
      var d = p(wd);
      log('validateText:start, locator: %s, text: %s', locator, expectedText);
      methods.find(locator, parentWebElement, expectedText).getText().then(function (actual) {
        log('validateText : actual : ' + actual + ' expected : ' + expectedText);
        if (actual === expectedText) {
          d.fulfill(true);
        } else {
          d.reject(new Error('[drivex.validateText] couldn\'t find text: ' + JSON.stringify(expectedText) + ' for locator ' + showLocator(locator)));
        }
      });
      return d.promise;
    },
    /**
     *validateAttributeValue validates the attribute for a WebElement
     * @param locator
     * @param parentWebElement (optional)
     * @param attribute value
     * @param expected text
     * @returns {WebElementPromise} resolves to true or throw error
     */
    validateAttributeValue: function (locator, parentWebElement, attribute, expectedText) {
      var d = p(wd);
      log('validateAttributeValue:start, locator: %s, text: %s', locator, expectedText);
      methods.find(locator, parentWebElement, expectedText).getAttribute(attribute).then(function (actual) {
        log('validateAttributeValue : actual : ' + actual + ' expected : ' + expectedText);
        if (actual === expectedText) {
          d.fulfill(true);
        } else {
          d.reject(new Error('[drivex.validateAttributeValue] couldn\'t find value ' + JSON.stringify(expectedText) + ' for locator ' + showLocator(locator) + ' and attribute ' + JSON.stringify(attribute)));
        }
      });
      return d.promise;
    }
  };
  return methods;
};

function showLocator(locator) {
  if (locator instanceof Function) {
    return "[Function]";
  } else {
    return JSON.stringify(locator)
  }
}
