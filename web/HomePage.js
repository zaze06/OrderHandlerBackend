(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Method = void 0;
var Method;
(function (Method) {
    Method["LOGIN"] = "LOGIN";
    Method["AUTHORISE"] = "AUTHORISE";
    Method["AUTHORISED"] = "AUTHORISED";
    Method["CHECK"] = "CHECK";
    Method["REDIRECT"] = "REDIRECT";
    Method["UPDATE_ORDERS"] = "UPDATE_ORDERS";
    Method["UPDATE_ORDER"] = "UPDATE_ORDER";
    Method["IDENTIFIER"] = "IDENTIFIER";
    Method["PRINT"] = "PRINT";
    Method["LIST"] = "LIST";
    Method["REQUEST_ORDERS"] = "REQUEST_ORDERS";
    Method["INFO"] = "INFO";
    Method["ORDER"] = "ORDER";
    Method["LOGOUT"] = "LOGOUT";
    Method["ORDER_INFO"] = "ORDER_INFO";
    Method["NEXT_STAGE"] = "NEXT_STAGE";
    Method["PREVIOUS_STAGE"] = "PREVIOUS_STAGE";
    Method["LOGIN_ERROR"] = "LOGIN_ERROR";
    Method["NEWSLETTER_SEND"] = "NEWSLETTER_SEND";
})(Method || (exports.Method = Method = {}));

},{}],2:[function(require,module,exports){
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var method_1 = require("../app/packages/method");
var Cookies = require("js-cookie");
var ws = new WebSocket("wss://orders.lassehjalpen.se"); // orders.lassehjalpen.se
var errorMessage = document.getElementById('error-message');
var lang = document.location.href.split("/")[3];
ws.addEventListener("error", console.error);
ws.addEventListener("message", function (data) {
    var dataPackage = JSON.parse(data.data);
    if (dataPackage.method === method_1.Method.AUTHORISED) {
        Cookies.set("accessToken", dataPackage.data.accessToken, {
            expires: dataPackage.data.expirationDate,
            path: "/",
            domain: "lassehjalpen.se",
            sameSite: "None",
            secure: true
        });
        window.location.href = dataPackage.data.page;
    }
    else if (dataPackage.method === method_1.Method.REDIRECT) {
        window.location.href = dataPackage.data.page;
    }
    else if (dataPackage.method === method_1.Method.LOGIN_ERROR) {
        errorMessage.style.display = 'block';
    }
});
ws.addEventListener("open", function () {
});
ws.addEventListener("close", function () {
});
document.getElementById('loginForm').addEventListener('submit', function (event) {
    return __awaiter(this, void 0, void 0, function () {
        var username, encoder, hashedBuffer, password;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    event.preventDefault();
                    username = document.getElementById('email').value;
                    encoder = new TextEncoder();
                    return [4 /*yield*/, crypto.subtle.digest('SHA-256', encoder.encode(document.getElementById('password').value))];
                case 1:
                    hashedBuffer = _a.sent();
                    password = Array.from(new Uint8Array(hashedBuffer))
                        .map(function (byte) { return byte.toString(16).padStart(2, '0'); })
                        .join('');
                    // Log the hashed password (for demonstration purposes)
                    //console.log(`Username: ${username}, Hashed Password: ${hashedPassword}`);
                    ws.send(JSON.stringify({
                        method: method_1.Method.LOGIN,
                        data: {
                            username: username,
                            password: password
                        }
                    }));
                    return [2 /*return*/];
            }
        });
    });
});
// @ts-ignore
window.logoutButton = function () {
    var loginForm = document.querySelector('.login-form');
    loginForm.style.display = (loginForm.style.display === "none" || loginForm.style.display === "") ? "block" : "none";
};
var searchBar = document.getElementById("orderSearch");
var regexp = /^#[0-9]{4,}$/;
searchBar.addEventListener("keydown", function (evt) {
    if ((evt.key === "Enter" || evt.key === "\n") && searchBar.value.match(regexp)) {
        ws.send(JSON.stringify({
            method: method_1.Method.ORDER,
            data: {
                lang: lang,
                orderID: searchBar.value
            }
        }));
    }
});
searchBar.addEventListener("input", function (evt) {
    if (searchBar.value.match(regexp)) {
        searchBar.style.backgroundColor = "#3b3b3b";
    }
    else {
        searchBar.style.backgroundColor = "#720505";
    }
});

},{"../app/packages/method":1,"js-cookie":3}],3:[function(require,module,exports){
/*! js-cookie v3.0.5 | MIT */
;
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, (function () {
    var current = global.Cookies;
    var exports = global.Cookies = factory();
    exports.noConflict = function () { global.Cookies = current; return exports; };
  })());
})(this, (function () { 'use strict';

  /* eslint-disable no-var */
  function assign (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        target[key] = source[key];
      }
    }
    return target
  }
  /* eslint-enable no-var */

  /* eslint-disable no-var */
  var defaultConverter = {
    read: function (value) {
      if (value[0] === '"') {
        value = value.slice(1, -1);
      }
      return value.replace(/(%[\dA-F]{2})+/gi, decodeURIComponent)
    },
    write: function (value) {
      return encodeURIComponent(value).replace(
        /%(2[346BF]|3[AC-F]|40|5[BDE]|60|7[BCD])/g,
        decodeURIComponent
      )
    }
  };
  /* eslint-enable no-var */

  /* eslint-disable no-var */

  function init (converter, defaultAttributes) {
    function set (name, value, attributes) {
      if (typeof document === 'undefined') {
        return
      }

      attributes = assign({}, defaultAttributes, attributes);

      if (typeof attributes.expires === 'number') {
        attributes.expires = new Date(Date.now() + attributes.expires * 864e5);
      }
      if (attributes.expires) {
        attributes.expires = attributes.expires.toUTCString();
      }

      name = encodeURIComponent(name)
        .replace(/%(2[346B]|5E|60|7C)/g, decodeURIComponent)
        .replace(/[()]/g, escape);

      var stringifiedAttributes = '';
      for (var attributeName in attributes) {
        if (!attributes[attributeName]) {
          continue
        }

        stringifiedAttributes += '; ' + attributeName;

        if (attributes[attributeName] === true) {
          continue
        }

        // Considers RFC 6265 section 5.2:
        // ...
        // 3.  If the remaining unparsed-attributes contains a %x3B (";")
        //     character:
        // Consume the characters of the unparsed-attributes up to,
        // not including, the first %x3B (";") character.
        // ...
        stringifiedAttributes += '=' + attributes[attributeName].split(';')[0];
      }

      return (document.cookie =
        name + '=' + converter.write(value, name) + stringifiedAttributes)
    }

    function get (name) {
      if (typeof document === 'undefined' || (arguments.length && !name)) {
        return
      }

      // To prevent the for loop in the first place assign an empty array
      // in case there are no cookies at all.
      var cookies = document.cookie ? document.cookie.split('; ') : [];
      var jar = {};
      for (var i = 0; i < cookies.length; i++) {
        var parts = cookies[i].split('=');
        var value = parts.slice(1).join('=');

        try {
          var found = decodeURIComponent(parts[0]);
          jar[found] = converter.read(value, found);

          if (name === found) {
            break
          }
        } catch (e) {}
      }

      return name ? jar[name] : jar
    }

    return Object.create(
      {
        set,
        get,
        remove: function (name, attributes) {
          set(
            name,
            '',
            assign({}, attributes, {
              expires: -1
            })
          );
        },
        withAttributes: function (attributes) {
          return init(this.converter, assign({}, this.attributes, attributes))
        },
        withConverter: function (converter) {
          return init(assign({}, this.converter, converter), this.attributes)
        }
      },
      {
        attributes: { value: Object.freeze(defaultAttributes) },
        converter: { value: Object.freeze(converter) }
      }
    )
  }

  var api = init(defaultConverter, { path: '/' });
  /* eslint-enable no-var */

  return api;

}));

},{}]},{},[2]);
