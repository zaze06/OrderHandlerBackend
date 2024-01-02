(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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

},{}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var cookies_1 = require("./api/cookies");
var accessToken = cookies_1.Cookies.get("accessToken").value;
var ws = new WebSocket("wss://orders.lassehjalpen.se:443"); //
var items = document.getElementById("items");
var info = document.getElementById("info");
var orders = [];
ws.addEventListener("error", console.error);
function createItem(listItem) {
    var listItemData = listItem["data"];
    if (orders[listItemData["order"]])
        return;
    orders[listItemData["order"]] = true;
    var newItem = document.createElement("div");
    newItem.style.maxHeight = "22px";
    newItem.className = "item";
    var orderDiv = document.createElement("div");
    var orderItem = document.createElement("a");
    var nameDiv = document.createElement("div");
    var nameItem = document.createElement("a");
    var emailDiv = document.createElement("div");
    var emailItem = document.createElement("a");
    var aDiv = document.createElement("div");
    var aItem = document.createElement("a");
    var printDiv = document.createElement("div");
    var printButton = document.createElement("button");
    orderDiv.appendChild(orderItem);
    orderDiv.className = "itemInfo";
    orderItem.innerText = listItemData["order"] || " ";
    orderItem.className = "itemText";
    nameDiv.appendChild(nameItem);
    nameDiv.className = "itemInfo";
    nameItem.innerText = listItem["data"]["information"]["name"] || " ";
    nameItem.className = "itemText";
    emailDiv.appendChild(emailItem);
    emailDiv.className = "itemInfo";
    emailItem.innerText = listItem["data"]["information"]["email"] || " ";
    emailItem.className = "itemText";
    aDiv.appendChild(aItem);
    aDiv.className = "itemInfo";
    aItem.innerText = " ";
    aItem.className = "itemText";
    printDiv.appendChild(printButton);
    printDiv.className = "itemInfo";
    printButton.onclick = function () {
        console.log(listItemData["order"]);
        sendPrint(listItemData["order"]);
    };
    printButton.className = "itemText";
    printButton.innerText = "print";
    newItem.appendChild(orderDiv);
    newItem.appendChild(nameDiv);
    newItem.appendChild(emailDiv);
    newItem.appendChild(aDiv);
    newItem.appendChild(printDiv);
    items.appendChild(newItem);
    for (var i = 0; i < listItemData["products"].length; i++) {
        var listItem_1 = listItemData["products"][i];
        var newItem_1 = document.createElement("div");
        newItem_1.style.maxHeight = "22px";
        newItem_1.className = "item";
        var emptyDiv = document.createElement("div");
        var emptyItem = document.createElement("a");
        var nameDiv_1 = document.createElement("div");
        var nameItem_1 = document.createElement("a");
        var descriptionDiv = document.createElement("div");
        var descriptionItem = document.createElement("a");
        var amountDiv = document.createElement("div");
        var amountItem = document.createElement("a");
        var aDiv_1 = document.createElement("div");
        var aItem_1 = document.createElement("a");
        emptyDiv.appendChild(emptyItem);
        emptyDiv.className = "itemInfo";
        emptyItem.innerText = " ";
        emptyItem.className = "itemText";
        nameDiv_1.appendChild(nameItem_1);
        nameDiv_1.className = "itemInfo";
        nameItem_1.innerText = listItem_1["name"] || " ";
        nameItem_1.className = "itemText";
        descriptionDiv.appendChild(descriptionItem);
        descriptionDiv.className = "itemInfo";
        descriptionItem.innerText = listItem_1["description"] || " ";
        descriptionItem.className = "itemText";
        amountDiv.appendChild(amountItem);
        amountDiv.className = "itemInfo";
        amountItem.innerText = listItem_1["amount"] || " ";
        amountItem.className = "itemText";
        aDiv_1.appendChild(aItem_1);
        aDiv_1.className = "itemInfo";
        aItem_1.className = "itemText";
        aItem_1.innerText = " ";
        newItem_1.appendChild(emptyDiv);
        newItem_1.appendChild(nameDiv_1);
        newItem_1.appendChild(descriptionDiv);
        newItem_1.appendChild(amountDiv);
        newItem_1.appendChild(aDiv_1);
        items.appendChild(newItem_1);
    }
}
ws.addEventListener("message", function (data) {
    var dataPackage = JSON.parse(data.data);
    console.log(dataPackage);
    var receivedPackageData = dataPackage["data"];
    if (dataPackage["method"] === "UPDATE_ORDERS") {
        createItem(receivedPackageData);
    }
    else if (dataPackage["method"] === "LIST") {
        for (var i = 0; i < receivedPackageData["list"].length; i++) {
            var listItem = receivedPackageData["list"][i];
            if (listItem["method"] === "UPDATE_ORDERS") {
                createItem(listItem);
            }
        }
    }
    else if (dataPackage["method"] === "info") {
        info.innerText = dataPackage["data"]["text"];
    }
    else if (dataPackage["method"] === "REDIRECT") {
        window.location.href = dataPackage["data"]["page"];
    }
});
ws.addEventListener("open", function () {
    if (!accessToken) {
        setTimeout(function () {
            if (!accessToken) {
                console.log("Cant access accessToken cookie");
            }
            else {
                ws.send(JSON.stringify({
                    method: "IDENTIFIER",
                    data: {
                        listener: "newOrder",
                        accessToken: accessToken
                    }
                }));
            }
        }, 1000);
    }
    else {
        ws.send(JSON.stringify({
            method: "IDENTIFIER",
            data: {
                listener: "newOrder",
                accessToken: accessToken
            }
        }));
    }
});
ws.addEventListener("close", function () {
});
var sendPrint = function (order) {
    ws.send(JSON.stringify({
        method: "PRINT",
        data: {
            order: order,
            accessToken: accessToken
        }
    }));
};
// @ts-ignore
window.logout = function () {
    ws.send(JSON.stringify({
        method: "LOGOUT",
        data: {
            accessToken: accessToken
        }
    }));
    cookies_1.Cookies.remove("accessToken");
};

},{"./api/cookies":1}]},{},[2]);
