# selenium-drivex
selenium-webdriver abstractions

## Methods

* `find`
  * `@argument locator {Locator}`
  * `@argument parentWebElement {WebElement} (optional)`
  * `@returns {Promise}` resolves to a WebElement or rejected
* `finds`
  * `@argument locator {Locator}`
  * `@argument parentWebElement {WebElement} (optional)`
  * `@returns {Promise}` resolves to an array of WebElements or []
* `present`
  * `@argument locator {Locator}`
  * `@argument parentWebElement {WebElement} (optional)`
  * `@returns {Promise}` resolves to true or false
* `visible`
  * `@argument locator {Locator}`
  * `@argument parentWebElement {WebElement} (optional)`
  * `@returns {Promise}` resolves to true/false or rejected
* `waitForElement`
  * `@argument locator {Locator}`
  * `@argument timeout {Number}`
  * `@argument msg {String} (optional)`
  * `@returns {Promise}` resolves to WebElement or rejected
* `waitForElementVisible`
  * `@argument locator {Locator}`
  * `@argument timeout {Number}`
  * `@argument msg {String} (optional)`
  * `@returns {Promise}` resolves to WebElement or rejected
* `validateText` validates the text for a WebElement
  * `@argument locator {Locator}`
  * `@argument parentWebElement (optional)`
  * `@argument expected value
  * `@returns {Promise}`resolves to true or rejected
* `validateAttributeValue` validates the attribute value for a WebElement
  * `@argument locator {Locator}`
  * `@argument parentWebElement (optional)`
  * `@argument attribute value`
  * `@argument expected value
  * `@returns {Promise}`resolves to true or rejected
