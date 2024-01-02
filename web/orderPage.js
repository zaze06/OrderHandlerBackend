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
Object.defineProperty(exports, "__esModule", { value: true });
var method_1 = require("../app/packages/method");
var ws = new WebSocket("wss://orders.lassehjalpen.se");
var pathArray = window.location.href.split('/');
var orderNumber = parseInt(pathArray[pathArray.length - 1]);
var received = document.getElementById("received");
var packed = document.getElementById("packed");
var shipped = document.getElementById("shipped");
var delivered = document.getElementById("delivered");
ws.addEventListener("open", function () {
    send({
        method: method_1.Method.ORDER_INFO,
        data: {
            order: orderNumber
        }
    });
});
ws.addEventListener("error", console.error);
ws.addEventListener("message", function (data) {
    var dataPackage = JSON.parse(data.data);
    if (dataPackage.method === method_1.Method.ORDER_INFO) {
        switch (dataPackage.data.orderInfo.status) {
            case 4: setValid(delivered);
            case 3: setValid(shipped);
            case 2: setValid(packed);
            case 1:
                setValid(received);
                break;
        }
    }
    else if (dataPackage.method === method_1.Method.REDIRECT) {
        window.location.href = dataPackage.data.page;
    }
});
var setValid = function (element) {
    element.innerText = "✓";
    element.style.color = "green";
};
var send = function (dataPackage) {
    ws.send(JSON.stringify(dataPackage));
};

},{"../app/packages/method":1}]},{},[2]);
