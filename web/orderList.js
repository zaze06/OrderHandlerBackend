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
var Cookies = require("js-cookie");
var method_1 = require("../app/packages/method");
var accessToken = Cookies.get("accessToken");
var ws = new WebSocket("wss://orders.lassehjalpen.se"); // orders.lassehjalpen.se
var items = document.getElementById("items");
var info = document.getElementById("info");
var logoutButton = document.getElementById("logoutButton");
var orders = [];
ws.addEventListener("error", console.error);
function statusString(status) {
    switch (status) {
        case 4: return ("delivered");
        case 3: return ("shipped");
        case 2: return ("packed");
        case 1: return ("received");
    }
}
function createItem(listItem) {
    var listItemData = listItem.data;
    console.log(listItemData);
    if (orders[listItemData.order])
        return;
    orders[listItemData.order] = true;
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
    var statusDiv = document.createElement("div");
    var statusItem = document.createElement("a");
    var printDiv = document.createElement("div");
    var printButton = document.createElement("button");
    var nextStepButton = document.createElement("button");
    var previousStageButton = document.createElement("button");
    orderDiv.appendChild(orderItem);
    orderDiv.className = "itemInfo";
    orderItem.innerText = listItemData.order.toString() || " ";
    orderItem.className = "itemText";
    nameDiv.appendChild(nameItem);
    nameDiv.className = "itemInfo";
    nameItem.innerText = listItem.data.information.name || " ";
    nameItem.className = "itemText";
    emailDiv.appendChild(emailItem);
    emailDiv.className = "itemInfo";
    emailItem.innerText = listItem.data.information.email || " ";
    emailItem.className = "itemText";
    aDiv.appendChild(aItem);
    aDiv.className = "itemInfo";
    aItem.innerText = " ";
    aItem.className = "itemText";
    statusDiv.appendChild(statusItem);
    statusDiv.className = "itemInfo";
    statusItem.innerText = listItem.data.status.toLowerCase() || " ";
    statusItem.className = "itemText";
    statusItem.id = listItem.data.order.toString() || " ";
    printDiv.appendChild(printButton);
    printDiv.className = "itemInfo";
    printButton.onclick = function () {
        console.log(listItemData.order);
        sendPrint(listItemData.order);
    };
    printButton.className = "itemText";
    printButton.innerText = "print";
    printButton.style.marginRight = "3px";
    printDiv.appendChild(nextStepButton);
    printDiv.className = "itemInfo";
    nextStepButton.onclick = function () {
        ws.send(JSON.stringify({
            method: method_1.Method.NEXT_STAGE,
            data: {
                order: listItemData.order,
                accessToken: accessToken
            }
        }));
    };
    nextStepButton.className = "itemText";
    nextStepButton.innerText = "Next";
    nextStepButton.style.marginRight = "3px";
    printDiv.appendChild(previousStageButton);
    printDiv.className = "itemInfo";
    previousStageButton.onclick = function () {
        ws.send(JSON.stringify({
            method: method_1.Method.PREVIOUS_STAGE,
            data: {
                order: listItemData.order,
                accessToken: accessToken
            }
        }));
    };
    previousStageButton.className = "itemText";
    previousStageButton.innerText = "Previous";
    newItem.appendChild(orderDiv);
    newItem.appendChild(nameDiv);
    newItem.appendChild(emailDiv);
    newItem.appendChild(aDiv);
    newItem.appendChild(statusDiv);
    newItem.appendChild(printDiv);
    items.appendChild(newItem);
    for (var i = 0; i < listItemData.products.length; i++) {
        var listItem_1 = listItemData.products[i];
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
        var bDiv = document.createElement("div");
        var bItem = document.createElement("a");
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
        amountItem.innerText = listItem_1.amount.toString() || " ";
        amountItem.className = "itemText";
        aDiv_1.appendChild(aItem_1);
        aDiv_1.className = "itemInfo";
        aItem_1.className = "itemText";
        aItem_1.innerText = " ";
        bDiv.appendChild(bItem);
        bDiv.className = "itemInfo";
        bItem.className = "itemText";
        bItem.innerText = " ";
        newItem_1.appendChild(emptyDiv);
        newItem_1.appendChild(nameDiv_1);
        newItem_1.appendChild(descriptionDiv);
        newItem_1.appendChild(amountDiv);
        newItem_1.appendChild(aDiv_1);
        newItem_1.appendChild(bDiv);
        items.appendChild(newItem_1);
    }
}
ws.addEventListener("message", function (data) {
    var dataPackage = JSON.parse(data.data);
    console.log(dataPackage);
    var receivedPackageData = dataPackage.data;
    if (dataPackage.method === method_1.Method.UPDATE_ORDERS) {
        //createItem(receivedPackageData);
    }
    else if (dataPackage.method === method_1.Method.LIST) {
        for (var i = 0; i < receivedPackageData["list"].length; i++) {
            var listItem = receivedPackageData["list"][i];
            if (listItem.method === method_1.Method.UPDATE_ORDERS) {
                createItem(listItem);
            }
        }
    }
    else if (dataPackage.method === method_1.Method.INFO) {
        info.innerText = dataPackage["data"]["text"];
    }
    else if (dataPackage.method === method_1.Method.REDIRECT) {
        window.location.href = dataPackage["data"]["page"];
    }
    else if (dataPackage.method === method_1.Method.UPDATE_ORDER) {
        document.getElementById(dataPackage.data.order.toString()).innerText = dataPackage.data.status.toLowerCase();
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
                    method: method_1.Method.IDENTIFIER,
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
            method: method_1.Method.IDENTIFIER,
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
        method: method_1.Method.PRINT,
        data: {
            order: order,
            accessToken: accessToken
        }
    }));
};
logoutButton.onclick = function () {
    ws.send(JSON.stringify({
        method: method_1.Method.LOGOUT,
        data: {
            accessToken: accessToken
        }
    }));
    Cookies.remove("accessToken", {
        path: "/",
        domain: "lassehjalpen.se",
        sameSite: "None",
        secure: true
    });
};

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
