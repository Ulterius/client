'use strict';

exports.__esModule = true;
exports['default'] = deprecated;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _warning = require('warning');

var _warning2 = _interopRequireDefault(_warning);

var warned = {};

function deprecated(propType, explanation) {
  return function validate(props, propName, componentName) {
    if (props[propName] != null) {
      var message = '"' + propName + '" property of "' + componentName + '" has been deprecated.\n' + explanation;
      if (!warned[message]) {
        _warning2['default'](false, message);
        warned[message] = true;
      }
    }

    return propType(props, propName, componentName);
  };
}

function _resetWarned() {
  warned = {};
}

deprecated._resetWarned = _resetWarned;
module.exports = exports['default'];