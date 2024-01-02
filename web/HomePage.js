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
    Method["IDENTIFIER"] = "IDENTIFIER";
    Method["PRINT"] = "PRINT";
    Method["LIST"] = "LIST";
    Method["REQUEST_ORDERS"] = "REQUEST_ORDERS";
    Method["INFO"] = "INFO";
    Method["ORDER"] = "ORDER";
    Method["LOGOUT"] = "LOGOUT";
    Method["ORDER_INFO"] = "ORDER_INFO";
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
var cookies_1 = require("./api/cookies");
var method_1 = require("../app/packages/method");
var ws = new WebSocket("wss://orders.lassehjalpen.se:443"); //
ws.addEventListener("error", console.error);
ws.addEventListener("message", function (data) {
    var dataPackage = JSON.parse(data.data);
    if (dataPackage.method === method_1.Method.AUTHORISED) {
        cookies_1.Cookies.set({
            name: "accessToken",
            value: dataPackage.data.accessToken,
            expires: dataPackage.data.expirationDate,
            domain: "orders.lassehjalpen.se"
        });
        window.location.href = dataPackage.data.page;
    }
    else if (dataPackage.method === method_1.Method.REDIRECT) {
        window.location.href = dataPackage.data.page;
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
window.toggleLoginForm = function () {
    var loginForm = document.querySelector('.login-form');
    loginForm.style.display = (loginForm.style.display === "none" || loginForm.style.display === "") ? "block" : "none";
    var loginDiv = document.querySelector('.login-div');
    loginDiv.style.display = "none";
};
var searchBar = document.getElementById("orderSearch");
var regexp = /^#[0-9]{4,}$/;
searchBar.addEventListener("keydown", function (evt) {
    if ((evt.key === "Enter" || evt.key === "\n") && searchBar.value.match(regexp)) {
        ws.send(JSON.stringify({
            method: method_1.Method.ORDER,
            data: {
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

},{"../app/packages/method":1,"./api/cookies":3}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cookies = void 0;
var Cookies = /** @class */ (function () {
    function Cookies() {
    }
    Cookies.parseCookies = function (cookieString) {
        var cookies = [];
        if (cookieString) {
            var cookiePairs = cookieString.split(';');
            for (var _i = 0, cookiePairs_1 = cookiePairs; _i < cookiePairs_1.length; _i++) {
                var pair = cookiePairs_1[_i];
                var _a = pair.trim().split('='), name_1 = _a[0], value = _a[1];
                var cookie = { name: name_1, value: value };
                cookies.push(cookie);
            }
        }
        return cookies;
    };
    Cookies.serializeCookie = function (cookie) {
        var cookieString = "".concat(cookie.name, "=").concat(cookie.value);
        if (cookie.expires) {
            var expiresDate = new Date(cookie.expires);
            cookieString += "; Expires=".concat(expiresDate.toUTCString());
        }
        if (cookie.domain) {
            cookieString += "; Domain=".concat(cookie.domain);
        }
        if (cookie.path) {
            cookieString += "; Path=".concat(cookie.path);
        }
        if (cookie.secure) {
            cookieString += "; Secure";
        }
        if (cookie.httpOnly) {
            cookieString += "; HttpOnly";
        }
        if (cookie.sameSite) {
            cookieString += "; SameSite=".concat(cookie.sameSite);
        }
        return cookieString;
    };
    Cookies.get = function (cookieName) {
        for (var _i = 0, _a = Cookies.parseCookies(document.cookie); _i < _a.length; _i++) {
            var cookie = _a[_i];
            if (cookie.name === cookieName) {
                return cookie;
            }
        }
        return undefined;
    };
    Cookies.set = function (cookie) {
        document.cookie = Cookies.serializeCookie(cookie);
    };
    Cookies.remove = function (cookieName) {
        var cookie = Cookies.get(cookieName);
        if (cookie) {
            cookie.expires = 0;
            document.cookie = Cookies.serializeCookie(cookie);
        }
    };
    return Cookies;
}());
exports.Cookies = Cookies;

},{}]},{},[2]);
