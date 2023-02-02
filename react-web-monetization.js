'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var React = require('react');
var React__default = _interopDefault(React);
var events = require('events');

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

function _iterableToArrayLimit(arr, i) {
  var _arr = [];
  var _n = true;
  var _d = false;
  var _e = undefined;

  try {
    for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance");
}

function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function _typeof2(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof2 = function _typeof2(obj) { return typeof obj; }; } else { _typeof2 = function _typeof2(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof2(obj); }

function _typeof(obj) {
  if (typeof Symbol === "function" && _typeof2(Symbol.iterator) === "symbol") {
    _typeof = function _typeof(obj) {
      return _typeof2(obj);
    };
  } else {
    _typeof = function _typeof(obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : _typeof2(obj);
    };
  }

  return _typeof(obj);
}

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

function _possibleConstructorReturn(self, call) {
  if (call && (_typeof(call) === "object" || typeof call === "function")) {
    return call;
  }

  return _assertThisInitialized(self);
}

function _getPrototypeOf(o) {
  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  };
  return _getPrototypeOf(o);
}

function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      writable: true,
      configurable: true
    }
  });
  if (superClass) _setPrototypeOf(subClass, superClass);
}

var GlobalWebMonetizationState =
/*#__PURE__*/
function (_EventEmitter) {
  _inherits(GlobalWebMonetizationState, _EventEmitter);

  function GlobalWebMonetizationState() {
    var _this;

    _classCallCheck(this, GlobalWebMonetizationState);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(GlobalWebMonetizationState).call(this));
    _this.state = typeof document !== 'undefined' && document.monetization && document.monetization.state;
    _this.paymentPointer = null;
    _this.requestId = null;
    _this.assetCode = null;
    _this.assetScale = null;
    _this.totalAmount = 0;
    _this.initialized = false;
    _this.boundMonetizationStart = _this.onMonetizationStart.bind(_assertThisInitialized(_assertThisInitialized(_this)));
    _this.boundMonetizationProgress = _this.onMonetizationProgress.bind(_assertThisInitialized(_assertThisInitialized(_this)));
    return _this;
  }

  _createClass(GlobalWebMonetizationState, [{
    key: "getState",
    value: function getState() {
      return {
        state: this.state,
        paymentPointer: this.paymentPointer,
        requestId: this.requestId,
        assetCode: this.assetCode,
        assetScale: this.assetScale,
        totalAmount: this.totalAmount
      };
    }
  }, {
    key: "init",
    value: function init() {
      if (!this.initialized && typeof document !== 'undefined' && document.monetization) {
        this.initialized = true;
        document.monetization.addEventListener('monetizationstart', this.boundMonetizationStart);
        document.monetization.addEventListener('monetizationprogress', this.boundMonetizationProgress);
      }
    }
  }, {
    key: "terminate",
    value: function terminate() {
      if (this.initialized && typeof document !== 'undefined' && document.monetization) {
        this.initialized = false;
        document.monetization.removeEventListener('monetizationstart', this.boundMonetizationStart);
        document.monetization.removeEventListener('monetizationprogress', this.boundMonetizationProgress);
      }
    }
  }, {
    key: "onMonetizationStart",
    value: function onMonetizationStart(ev) {
      var _ev$detail = ev.detail,
          paymentPointer = _ev$detail.paymentPointer,
          requestId = _ev$detail.requestId;
      this.state = typeof document !== 'undefined' && document.monetization && document.monetization.state;
      this.paymentPointer = paymentPointer;
      this.requestId = requestId;
      this.emit('monetizationstart');
    }
  }, {
    key: "onMonetizationProgress",
    value: function onMonetizationProgress(ev) {
      var _ev$detail2 = ev.detail,
          amount = _ev$detail2.amount,
          assetCode = _ev$detail2.assetCode,
          assetScale = _ev$detail2.assetScale;
      this.totalAmount = this.totalAmount + Number(amount);
      this.assetCode = assetCode;
      this.assetScale = assetScale;
      this.emit('monetizationprogress');
    }
  }]);

  return GlobalWebMonetizationState;
}(events.EventEmitter);
var globalWebMonetizationState;
function getGlobalWebMonetizationState() {
  if (!globalWebMonetizationState) {
    globalWebMonetizationState = new GlobalWebMonetizationState();
  }

  return globalWebMonetizationState;
}
function initGlobalWebMonetizationState() {
  getGlobalWebMonetizationState().init();
}

function useMonetizationCounter() {
  // get the singleton WM state
  var webMonetizationState = getGlobalWebMonetizationState();
  webMonetizationState.init();

  var _useState = React.useState(webMonetizationState.getState()),
      _useState2 = _slicedToArray(_useState, 2),
      monetizationDetails = _useState2[0],
      setMonetizationDetails = _useState2[1]; // create something we can mutate


  var monetizationDetailsCopy = Object.assign({}, monetizationDetails);
  React.useEffect(function () {
    var onMonetizationStart = function onMonetizationStart() {
      // this is purposely mutating because sometimes we get multiple state
      // updates before reload
      setMonetizationDetails(Object.assign(monetizationDetailsCopy, webMonetizationState.getState()));
    };

    var onMonetizationProgress = function onMonetizationProgress() {
      // this is purposely mutating because sometimes we get multiple state
      // updates before reload
      setMonetizationDetails(Object.assign(monetizationDetailsCopy, webMonetizationState.getState()));
    };

    webMonetizationState.on('monetizationstart', onMonetizationStart);
    webMonetizationState.on('monetizationprogress', onMonetizationProgress);
    return function () {
      webMonetizationState.removeListener('monetizationstart', onMonetizationStart);
      webMonetizationState.removeListener('monetizationprogress', onMonetizationProgress);
    };
  });
  return monetizationDetails;
}

function useMonetizationState() {
  // get the singleton WM state
  var webMonetizationState = getGlobalWebMonetizationState();
  webMonetizationState.init();

  var _webMonetizationState = webMonetizationState.getState(),
      state = _webMonetizationState.state,
      requestId = _webMonetizationState.requestId,
      paymentPointer = _webMonetizationState.paymentPointer;

  var _useState = React.useState({
    state: state,
    requestId: requestId,
    paymentPointer: paymentPointer
  }),
      _useState2 = _slicedToArray(_useState, 2),
      monetizationState = _useState2[0],
      setMonetizationState = _useState2[1];

  React.useEffect(function () {
    if (!document.monetization) return;

    var onStart = function onStart() {
      var _webMonetizationState2 = webMonetizationState.getState(),
          state = _webMonetizationState2.state,
          requestId = _webMonetizationState2.requestId,
          paymentPointer = _webMonetizationState2.paymentPointer;

      setMonetizationState({
        state: state,
        requestId: requestId,
        paymentPointer: paymentPointer
      });
    };

    webMonetizationState.on('monetizationstart', onStart);
    return function () {
      webMonetizationState.removeListener('monetizationstart', onStart);
    };
  });
  return monetizationState;
}

function IfWebMonetized(_ref) {
  var children = _ref.children,
      showOnPending = _ref.showOnPending;

  var _useMonetizationState = useMonetizationState(),
      state = _useMonetizationState.state;

  if (state === 'started' || state === 'pending' && showOnPending) {
    return React__default.createElement(React__default.Fragment, null, children);
  } else {
    return React__default.createElement(React__default.Fragment, null);
  }
}
function IfNotWebMonetized(_ref2) {
  var children = _ref2.children,
      _ref2$pendingTimeout = _ref2.pendingTimeout,
      pendingTimeout = _ref2$pendingTimeout === void 0 ? 2000 : _ref2$pendingTimeout;

  var _useState = React.useState(false),
      _useState2 = _slicedToArray(_useState, 2),
      pendingTimedOut = _useState2[0],
      setPendingTimedOut = _useState2[1];

  var _useMonetizationState2 = useMonetizationState(),
      state = _useMonetizationState2.state;

  React.useEffect(function () {
    var timer = setTimeout(function () {
      setPendingTimedOut(true);
    }, pendingTimeout);
    return function () {
      clearTimeout(timer);
    };
  });

  if (state === 'started' || state === 'pending' && !pendingTimedOut) {
    return React__default.createElement(React__default.Fragment, null);
  } else {
    return React__default.createElement(React__default.Fragment, null, children);
  }
}
function IfWebMonetizationPending(_ref3) {
  var children = _ref3.children;

  var _useMonetizationState3 = useMonetizationState(),
      state = _useMonetizationState3.state;

  if (state === 'pending') {
    return React__default.createElement(React__default.Fragment, null, children);
  } else {
    return React__default.createElement(React__default.Fragment, null);
  }
}

exports.initGlobalWebMonetizationState = initGlobalWebMonetizationState;
exports.useMonetizationCounter = useMonetizationCounter;
exports.useMonetizationState = useMonetizationState;
exports.IfWebMonetized = IfWebMonetized;
exports.IfNotWebMonetized = IfNotWebMonetized;
exports.IfWebMonetizationPending = IfWebMonetizationPending;
//# sourceMappingURL=react-web-monetization.js.map
