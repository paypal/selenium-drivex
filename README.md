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
* `selectOptionByText`
  * `@argument locator {Locator}` locator which must resolve to a select element
  * `@argument optionText {String}` option text to select
  * `@argument parentWebElement {WebElement} (optional)`
  * `@returns {Promise}` resolves when the option is selected or reject if there is an error at selection
* `selectOptionByValue`
  * `@argument locator {Locator}` locator which must resolve to a select element
  * `@argument optionValue {String}` option value to select
  * `@argument parentWebElement {WebElement} (optional)`
  * `@returns {Promise}` resolves when the option is selected or reject if there is an error at selection
* `validateText` validates the text for a WebElement
  * `@argument locator {Locator}`
  * `@argument parentWebElement (optional)`
  * `@argument text {String}` expected text
  * `@returns {Promise}`resolves to true or rejected
* `validateAttributeValue` validates the attribute value for a WebElement
  * `@argument locator {Locator}`
  * `@argument parentWebElement (optional)`
  * `@argument attribute value`
  * `@argument value {String}` expected value
  * `@returns {Promise}`resolves to true or rejected
