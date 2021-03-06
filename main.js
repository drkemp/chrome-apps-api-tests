(function() {

'use strict';

/******************************************************************************/

// GLOBAL
window.tests = {};

/******************************************************************************/

function getURLParameter(name) {
  return decodeURIComponent(
      (new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [,""])[1].replace(/\+/g, '%20')
    ) || null;
}

function getMode() {
  //return getURLParameter('mode') || 'main';
  return 'main';
}

function setTitle(title) {
  var el = document.getElementById('title');
  el.textContent = title;
}

function createButton(title, callback) {
  var content = document.getElementById('content');
  var div = document.createElement('div');
  var button = document.createElement('a');
  button.textContent = title;
  button.onclick = function(e) {
    e.preventDefault();
    callback();
  };
  button.classList.add('topcoat-button');
  div.appendChild(button);
  content.appendChild(div);
}

function clearContent() {
  var content = document.getElementById('content');
  //while (content.firstChild) content.removeChild(content.firstChild);
  // TODO
}

function logger() {
  console.log.apply(console, Array.prototype.slice.apply(arguments));
  var el = document.getElementById('log');
  var div = document.createElement('div');
  div.textContent = Array.prototype.slice.apply(arguments).map(function(arg) {
      return (typeof arg === 'string') ? arg : JSON.stringify(arg);
    }).join(' ');
  el.appendChild(div);
  el.scrollTop = el.scrollHeight;
}

/******************************************************************************/

function setUpJasmine() {
  // Set up jasmine
  var jasmine = jasmineRequire.core(jasmineRequire);
  jasmineRequire.html(jasmine);
  var jasmineEnv = jasmine.getEnv();

  jasmine.DEFAULT_TIMEOUT_INTERVAL = 300;
  jasmineEnv.catchExceptions(true);

  createHtmlReporter(jasmine);

  // Set up jasmine interface
  var jasmineInterface = {
    it: function(desc, func) {
      return jasmineEnv.it(desc, func);
    },

    xit: function(desc, func) {
      return jasmineEnv.xit(desc, func);
    },

    beforeEach: function(beforeEachFunction) {
      return jasmineEnv.beforeEach(beforeEachFunction);
    },

    afterEach: function(afterEachFunction) {
      return jasmineEnv.afterEach(afterEachFunction);
    },

    expect: function(actual) {
      return jasmineEnv.expect(actual);
    },

    pending: function() {
      return jasmineEnv.pending();
    },

    addMatchers: function(matchers) {
      return jasmineEnv.addMatchers(matchers);
    },

    spyOn: function(obj, methodName) {
      return jasmineEnv.spyOn(obj, methodName);
    },

    clock: jasmineEnv.clock,

    jsApiReporter: new jasmine.JsApiReporter({
      timer: new jasmine.Timer()
    }),

    jasmine: jasmine,

    log: logger,
  };
  ['describe', 'xdescribe'].forEach(function(method) {
    jasmineInterface[method] = jasmineEnv[method].bind(jasmineEnv);
  });

  jasmineEnv.addReporter(jasmineInterface.jsApiReporter);

  var target = window;
  for (var property in jasmineInterface) {
    target[property] = jasmineInterface[property];
  }
}

function createHtmlReporter(jasmine) {
   // Set up jasmine html reporter
  var jasmineEnv = jasmine.getEnv();
  var contentEl = document.getElementById('content');
  var htmlReporter = new jasmine.HtmlReporter({
    env: jasmineEnv,
    queryString: function() { return null },
    onRaiseExceptionsClick: function() { /*queryString.setParam("catch", !jasmineEnv.catchingExceptions());*/ },
    getContainer: function() { return contentEl; },
    createElement: function() { return document.createElement.apply(document, arguments); },
    createTextNode: function() { return document.createTextNode.apply(document, arguments); },
    timer: new jasmine.Timer()
  });
  htmlReporter.initialize();

  jasmineEnv.addReporter(htmlReporter);
}

/******************************************************************************/

function runAutoTests() {
  setTitle('Auto Tests');
  clearContent();
  createButton('Reset', chrome.runtime.reload);

  Object.keys(window.tests).forEach(function(key) {
    window.tests[key].defineAutoTests();
  });

  // Run the tests!
  var jasmineEnv = jasmine.getEnv();
  jasmineEnv.execute();
}

/******************************************************************************/

function runManualTests() {
  setTitle('Manual Tests');
  clearContent();
  createButton('Reset', chrome.runtime.reload);
}

/******************************************************************************/

function loaded() {
  setTitle('Cordova Tests');
  setUpJasmine();
  clearContent();
  createButton('Auto Tests', runAutoTests);
  createButton('Manual Tests', runManualTests);
}

document.addEventListener("DOMContentLoaded", loaded);

/******************************************************************************/

}());
