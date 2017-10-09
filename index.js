var debug = require('debug');
var log = debug('selenium-drivex');
var async = require('async');

module.exports = function drivex(driver, wd) {
  var methods = {
    find: function (locator, el) {
      return (el ? el : driver).findElement(locator);
    },
    /**
     * wraps Selenium WebDriver/WebElement.findElements
     * @param locator {LocatorJSON}
     * @param el {WebElement}
     * @returns {Promise} resolves to an array of WebElements or []
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
      return methods.find(locator, el).then(function (elt) {
        return elt.isDisplayed();
      });
    },
    dragDrop: function (sourceLocator, targetLocator) {
      log('dragDrop from ', sourceLocator);
      log('dragDrop to ', targetLocator);
      return methods.find(sourceLocator).then(function (source) {
        var target = methods.find(targetLocator);
        driver.action().dragAndDrop(source, target).perform(); 
        return true;
      }).then(null, function (err) {
        log('dragDrop', err);
        log(err.stack);
        throw new Error('[drivex.dragDop] Element not locatable');
      })
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
      return driver.wait(wd.until.elementLocated(locator), timeout, msg).then(function () {
        log('waitForElement: found', locator);
        return methods.find(locator);
      }, function (err) {
        log('waitForElement', err);
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
      function waitReturnElement() {
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

      log('waitForElementVisible', locator);
      return driver.wait(function () {
        return methods.present(locator);
      }, timeout, msg).then(function () {
        driver.wait(function () {
          return methods.visible(locator);
        }, timeout, msg)
      }).then(function (isVisible) {
        log('waitForElementVisible: ' + isVisible, locator);
        return methods.find(locator);
      }, function (err) {
        log('waitForElementVisible', err);
        log(err.stack);
        throw new Error(msg || '[drivex.waitForElementVisible] Element not visible: ' + showLocator(locator));
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
      function waitVisibleReturnElement() {
        return methods.waitForElementVisible(locator, timeout || 5000, msg);
      }

      var wep = new wd.WebElementPromise(driver, waitVisibleReturnElement());
      return wep;
    },
    waitNotPresent: function (locator, timeout, msg) {
      log('waitNotPresent', locator);
      return driver.wait(wd.until.elementLocated(locator), timeout || 5000, msg)
      .then(function () {
        log('waitNotPresent', locator);
        return methods.present(locator)
      }).then(Promise.reject, Promise.resolve);
    },
    waitNotVisible: function (locator, timeout, msg) {
      log('waitNotVisible', locator);
      return driver.wait(wd.until.elementLocated(locator), timeout || 5000, msg)
      .then(function () {
        log('waitNotVisible', locator);
        return methods.visible(locator)
      }).then(Promise.reject, Promise.resolve);
    },
    waitTextExists: function (locator, timeout, msg) {
      log('waitTextExists', locator);
      return driver.wait(wd.until.elementLocated(locator), timeout || 5000, msg)
      .then(function () {
        return methods.find(locator).getText();
      }).then(function (txt) {
        if (txt.length > 0) {
          return true;
        } else {
          throw new Error('couldn\'t find if text exists.');
        }
      }).then(null, function (err) {
        log('waitTextExists', err);
        log(err.stack);
        throw new Error(msg || '[drivex.waitTextExists] Element not locatable');
      });
    },
    waitTextEqual: function (locator, expectedText, timeout, msg) {
      log('waitTextEqual', locator);
      return driver.wait(wd.until.elementLocated(locator), timeout || 5000, msg)
      .then(function () {
        return methods.find(locator).getText();
      })
      .then(function (actual) {
        log('waitTextEqual : actual : ' + actual + 'expected : ' + expectedText);
        if (actual == expectedText) {
          return true;
        } else {
          throw new Error('couldn\'t find text: ' + expectedText);
        }
      }).then(null, function (err) {
        log('waitTextEqual', err);
        log(err.stack);
        throw new Error(msg || '[drivex.waitTextEqual] Element not locatable');
      });
    },
    waitTextNotEqual: function (locator, expectedText, timeout, msg) {
      log('waitTextNotEqual', locator);
      return driver.wait(wd.until.elementLocated(locator), timeout || 5000, msg)
      .then(function () {
        return methods.find(locator).getText();
      })
      .then(function (actual) {
        log('waitTextNotEqual : actual : ' + actual + 'expected : ' + expectedText);
        if (actual != expectedValue) {
          return true;
        } else {
          new Error('Element has text with content : ' + expectedValue);
        }
      }).then(null, function (err) {
        log('waitTextNotEqual', err);
        log(err.stack);
        throw new Error(msg || '[drivex.waitTextNotEqual] Element not locatable');
      });
    },
    waitAttributeEqual: function(locator, attribute, expectedValue, timeout, msg) {
      log('waitAttributeEqual', locator);
      return driver.wait(wd.until.elementLocated(locator), timeout || 5000, msg)
      .then(function () {
        return methods.find(locator).getAttribute(attribute);
      })
      .then(function (actual) {
        log('validateAttributeValue : actual : ' + actual + ' expected : ' + expectedValue);
        if (actual == expectedValue) {
          return true;
        } else {
          throw new Error('couldn\t find attribute with value: ' + expectedValue);
        }
      }).then(null, function (err) {
        log('waitAttributeEqual', err);
        log(err.stack);
        throw new Error(msg || '[drivex.waitAttributeEqual] Element not locatable');
      });
    },
    /**
     *
     * @param locator MUST resolve to a SELECT element
     * @param optionText option text to select
     * @param parentWebElement (optional)
     * @returns {Promise} resolves to a WebElement.click() (which resolves itself to a Promise)
     */
    selectByOptionText: function (locator, optionText, parentWebElement) {
      var d = wd.promise.defer();
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
      return d;
    },
    /**
     *
     * @param locator MUST resolve to a SELECT element
     * @param optionValue option attribute value to select
     * @param parentWebElement (optional)
     * @returns {Promise} resolves to a WebElement.click() (which resolves itself to a Promise)
     */
    selectByOptionValue: function (locator, optionValue, parentWebElement) {
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
      Object.keys(locatorObject).forEach(function(key) {
        var loc = locatorObject[key];
        elementTests.push(function() {
          return methods.waitForElementVisible(loc, 100).then(function() {
            keyFound = key;
            return true;
          }, function(err) {
            return false;
          });
        });
      });
      return driver.wait(function() {
        var elementTest = elementTests.shift();
        elementTests.push(elementTest);
        return elementTest();
      }, timeout || 5000).then(function() {
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
      var d = wd.promise.defer();
      methods.find(locator, parentWebElement,expectedText).getText().then(function (actual){
        log('validateText : actual : ' + actual + ' expected : ' + expectedText);
        if (actual === expectedText) {
          d.fulfill(true);
        } else {
          d.reject(new Error('[drivex.validateText] couldn\'t find text: ' + JSON.stringify(expectedText) + ' for locator ' + showLocator(locator)));
        }
      });
      return d;
    },
    /**
     *validateAttributeValue validates the attribute for a WebElement
     * @param locator
     * @param parentWebElement (optional)
     * @param attribute value
     * @param expected text
     * @returns {WebElementPromise} resolves to true or throw error
     */
    validateAttributeValue: function (locator, parentWebElement,attribute, expectedText) {
      var d = wd.promise.defer();
      methods.find(locator, parentWebElement,expectedText).getAttribute(attribute).then(function (actual) {
        log('validateAttributeValue : actual : ' + actual + ' expected : ' + expectedText);
        if (actual === expectedText) {
          d.fulfill(true);
        } else {
          d.reject(new Error('[drivex.validateAttributeValue] couldn\'t find value ' + JSON.stringify(expectedText) + ' for locator ' + showLocator(locator) + ' and attribute ' + JSON.stringify(attribute)));
        }
      });
      return d;
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
