var wd = require('selenium-webdriver');

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
      return (el ? el : driver).isElementPresent(locator).then(function(isPresent) {
        if (isPresent) {
          return methods.find(locator, el).then(function(elt) {
            return elt.isDisplayed();
          })
        } else {
          return false;
        }
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
    },
    /**
     * determine if only one of the WebElements in the elements array is visible
     * @param elements {Array} array of WebElements
     * @returns {Promise} promise resolves to single visible element from "elements" or Error
     */
    oneDisplayed: function (elements) {
      var length = elements.length,
        current = 0,
        displayedElt = null,
        returnError = new Error("[drivex.oneDisplayed] Didn't find any displayed elements"),
        d = wd.promise.defer();
      if (!length) {
        d.reject(new Error("[drivex.oneDisplayed] No WebElements passed in"));
      }
      async.whilst(function () {
        return current < length;
      }, function (callback) {
        elements[current].isDisplayed().
          then(function (disp) {
            if (disp && displayedElt === null) {
              displayedElt = elements[current];
              returnError = null;
            } else if (disp && displayedElt !== null) {
              returnError = new Error("[drivex.oneDisplayed] Found more than one displayed element");
            }
            current++;
            callback(returnError);
          })
      }, function (err) {
        if (err) {
          d.reject(err);
        } else {
          d.fulfill(displayedElt);
        }
      });
      return d.promise;
    },
    /**
     * Determine if all WebElements in elements array are enabled
     * @param elements {Array} array of WebElements
     * @returns {Promise} promise resolves to true or Error
     */
    allEnabled: function (elements) {
      var length = elements.length,
        current = 0,
        returnError = null,
        d = wd.promise.defer();
      if (!length) {
        d.reject(new Error("[drivex.allEnabled] No WebElements passed in"));
      }
      async.whilst(function () {
        return current < length;
      }, function (callback) {
        elements[current].isEnabled().
          then(function (enabled) {
            if (!enabled) {
              returnError = new Error("[drivex.allEnabled] All elements not enabled");
            }
            callback(returnError);
            current++;
          })
      }, function (err) {
        if (err) {
          d.reject(err);
        } else {
          d.fulfill(true);
        }
      });
      return d.promise;
    },
    /**
     * Determine if all WebElements in elements array are disabled
     * @param elements {Array} array of WebElements
     * @returns {Promise} promise resolves to true or Error
     */
    allDisabled: function (elements) {
      var length = elements.length,
        current = 0,
        returnError = null,
        d = wd.promise.defer();
      if (!length) {
        d.reject(new Error("[drivex.allDisabled] No WebElements passed in"));
      }
      async.whilst(function () {
        return current < length;
      }, function (callback) {
        elements[current].isEnabled().
          then(function (enabled) {
            if (enabled) {
              returnError = new Error("[drivex.allDisabled] All elements not disabled");
            }
            callback(returnError);
            current++;
          })
      }, function (err) {
        if (err) {
          d.reject(err);
        } else {
          d.fulfill(true);
        }
      });
      return d.promise;
    },
    /**
     * Determine if all WebElements in elements array are visible
     * @param elements {Array} array of WebElements
     * @returns {Promise} promise resolves to true or Error
     */
    allDisplayed: function (elements) {
      var length = elements.length,
        current = 0,
        returnError = null,
        d = wd.promise.defer();
      if (!length) {
        d.reject(new Error("[drivex.allDisplayed] No WebElements passed in"));
      }
      async.whilst(function () {
        return current < length;
      }, function (callback) {
        //console.log("allDisplayed, current", current);
        elements[current].isDisplayed().
          then(function (displayed) {
            //console.log("displayed",displayed);
            if (!displayed) {
              returnError = new Error("[drivex.allDisplayed] All elements not displayed");
            }

            current++;
            callback(returnError);
          })
      }, function (err) {
        if (err) {
          d.reject(err);
        } else {
          d.fulfill(true);
        }
      });
      return d.promise;
    },
    /**
     * Determine if all WebElements in elements array are hidden
     * @param elements {Array} array of WebElements
     * @returns {Promise} promise resolves to true or Error
     */
    allHidden: function (elements) {
      var length = elements.length,
        current = 0,
        returnError = null,
        d = wd.promise.defer();
      if (!length) {
        d.reject(new Error("[drivex.allHidden] No WebElements passed in"));
      }
      async.whilst(function () {
        return current < length;
      }, function (callback) {
        elements[current].isDisplayed().
          then(function (displayed) {
            if (displayed) {
              returnError = new Error("[drivex.allHidden] All elements not hidden");
            }
            current++;
            callback(returnError);

          })
      }, function (err) {
        if (err) {
          d.reject(err);
        } else {
          d.fulfill(true);
        }
      });
      return d.promise;
    }
  };
  return methods;
};