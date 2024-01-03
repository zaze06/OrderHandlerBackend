import { Method } from "../app/packages/method";
import { TranssmisionPackage } from "../app/packages/transsmisionPackage";

let ws: WebSocket = new WebSocket("wss://localhost"); // orders.lassehjalpen.se

let pathArray = window.location.href.split('/');
let orderNumber = parseInt(pathArray[pathArray.length - 1]);

let received  = document.getElementById("received");
let packed    = document.getElementById("packed");
let shipped   = document.getElementById("shipped");
let delivered = document.getElementById("delivered");

ws.addEventListener("open", () => {
    send({
        method: Method.ORDER_INFO,
        data: {
            order: orderNumber
        }
    });
})

ws.addEventListener("error", console.error);

ws.addEventListener("message", (data) => {
    let dataPackage: TranssmisionPackage = JSON.parse(data.data);

    if(dataPackage.method === Method.ORDER_INFO){
        switch (dataPackage.data.status) {
            case 4: setValid(delivered);
            case 3: setValid(shipped);
            case 2: setValid(packed);
            case 1: setValid(received); break;
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