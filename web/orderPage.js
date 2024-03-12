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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RawOrderStatus = void 0;
var RawOrderStatus;
(function (RawOrderStatus) {
    RawOrderStatus["DELIVERED"] = "DELIVERED";
    RawOrderStatus["SHIPPED"] = "SHIPPED";
    RawOrderStatus["PACKED"] = "PACKED";
    RawOrderStatus["RECEIVED"] = "RECEIVED";
    RawOrderStatus["UNKNOWN"] = "UNKNOWN";
})(RawOrderStatus || (exports.RawOrderStatus = RawOrderStatus = {}));
(function (RawOrderStatus) {
    function advance(orderStatus) {
        switch (orderStatus) {
            case RawOrderStatus.RECEIVED: return RawOrderStatus.PACKED;
            case RawOrderStatus.PACKED: return RawOrderStatus.SHIPPED;
            case RawOrderStatus.SHIPPED: return RawOrderStatus.DELIVERED;
            case RawOrderStatus.DELIVERED: return RawOrderStatus.DELIVERED;
        }
    }
    RawOrderStatus.advance = advance;
    function reverse(orderStatus) {
        switch (orderStatus) {
            case RawOrderStatus.RECEIVED:
                return RawOrderStatus.RECEIVED;
            case RawOrderStatus.PACKED:
                return RawOrderStatus.RECEIVED;
            case RawOrderStatus.SHIPPED:
                return RawOrderStatus.PACKED;
            case RawOrderStatus.DELIVERED:
                return RawOrderStatus.SHIPPED;
        }
    }
    RawOrderStatus.reverse = reverse;
})(RawOrderStatus || (exports.RawOrderStatus = RawOrderStatus = {}));

},{}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var method_1 = require("../app/packages/method");
var rawOrderStatus_1 = require("../app/packages/rawOrderStatus");
var ws = new WebSocket("wss://orders.lassehjalpen.se"); // orders.lassehjalpen.se
var pathArray = window.location.href.split('/');
var orderNumber = parseInt(pathArray[pathArray.length - 1]);
var received = document.getElementById("received");
var packed = document.getElementById("packed");
var shipped = document.getElementById("shipped");
var delivered = document.getElementById("delivered");
var order = document.getElementById("order");
var url = location.href;
var queryString = location.search.substring(1);
var paramPairs = queryString.split("&");
var params = {};
for (var i = 0; i < paramPairs.length; i++) {
    var keyValue = paramPairs[i].split("=");
    var key = keyValue[0];
    var value = keyValue[1];
    params[key] = value;
}
if (params["order"]) {
    order.innerText = "Order: " + params["order"];
}
ws.addEventListener("open", function () {
    if (params["order"]) {
        send({
            method: method_1.Method.ORDER_INFO,
            data: {
                order: params["order"]
            }
        });
    }
});
ws.addEventListener("error", console.error);
ws.addEventListener("message", function (data) {
    var dataPackage = JSON.parse(data.data);
    console.log(dataPackage);
    if (dataPackage.method === method_1.Method.ORDER_INFO) {
        switch (dataPackage.data.status) {
            case rawOrderStatus_1.RawOrderStatus.DELIVERED: setValid(delivered);
            case rawOrderStatus_1.RawOrderStatus.SHIPPED: setValid(shipped);
            case rawOrderStatus_1.RawOrderStatus.PACKED: setValid(packed);
            case rawOrderStatus_1.RawOrderStatus.RECEIVED:
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

},{"../app/packages/method":1,"../app/packages/rawOrderStatus":2}]},{},[3]);
