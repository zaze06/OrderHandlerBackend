import {Method} from "../app/packages/method";
import {TranssmisionPackage} from "../app/packages/transsmisionPackage";
import {RawOrderStatus} from "../app/packages/rawOrderStatus";

let ws: WebSocket = new WebSocket("wss://orders.lassehjalpen.se"); // orders.lassehjalpen.se

let pathArray = window.location.href.split('/');
let orderNumber = parseInt(pathArray[pathArray.length - 1]);

let received  = document.getElementById("received");
let packed    = document.getElementById("packed");
let shipped   = document.getElementById("shipped");
let delivered = document.getElementById("delivered");

let order     = document.getElementById("order");

let url = location.href;
let queryString = location.search.substring(1);
let paramPairs = queryString.split("&");

let params = {};
for (let i = 0; i < paramPairs.length; i++) {
    let keyValue = paramPairs[i].split("=");
    let key = keyValue[0];
    let value = keyValue[1];
    params[key] = value;
}

if(params["order"]) {
    order.innerText = "Order: " + params["order"];
}

ws.addEventListener("open", () => {
    if(params["order"]) {
        send({
            method: Method.ORDER_INFO,
            data: {
                order: params["order"]
            }
        });
    }
})

ws.addEventListener("error", console.error);

ws.addEventListener("message", (data) => {
    let dataPackage: TranssmisionPackage = JSON.parse(data.data);

    console.log(dataPackage)

    if(dataPackage.method === Method.ORDER_INFO){
        switch (dataPackage.data.status) {
            case RawOrderStatus.DELIVERED: setValid(delivered);
            case RawOrderStatus.SHIPPED: setValid(shipped);
            case RawOrderStatus.PACKED: setValid(packed);
            case RawOrderStatus.RECEIVED: setValid(received); break;
        }
    }
    else if(dataPackage.method === Method.REDIRECT){
        window.location.href = dataPackage.data.page;
    }
})

const setValid = (element: HTMLElement) => {
    element.innerText = "✓";
    element.style.color = "green"
}

const send = (dataPackage: TranssmisionPackage) => {
    ws.send(JSON.stringify(dataPackage));
}