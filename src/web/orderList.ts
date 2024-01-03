import {Cookies} from "./api/cookies";
import {TranssmisionPackage} from "../app/packages/transsmisionPackage";
import {Method} from "../app/packages/method";
import {Data} from "../app/packages/data";

let accessToken = Cookies.get("accessToken").value;

let ws = new WebSocket("wss://localhost"); // orders.lassehjalpen.se

let items = document.getElementById("items");
let info = document.getElementById("info");
let orders = [];

ws.addEventListener("error", console.error);

function statusString(status: number): string {
    switch (status) {
        case 4: return("delivered");
        case 3: return("shipped");
        case 2: return("packed");
        case 1: return("received");
    }
}

function createItem(listItem: TranssmisionPackage) {
    let listItemData: Data = listItem.data;
    console.log(listItemData);

    if(orders[listItemData.order]) return;
    orders[listItemData.order] = true;

    let newItem = document.createElement("div");
    newItem.style.maxHeight = "22px";
    newItem.className = "item";

    let orderDiv = document.createElement("div");
    let orderItem = document.createElement("a");
    let nameDiv = document.createElement("div");
    let nameItem = document.createElement("a");
    let emailDiv = document.createElement("div");
    let emailItem = document.createElement("a");
    let aDiv = document.createElement("div");
    let aItem = document.createElement("a");
    let statusDiv = document.createElement("div");
    let statusItem = document.createElement("a");
    let printDiv = document.createElement("div");
    let printButton = document.createElement("button");
    let nextStepButton = document.createElement("button");
    let previousStageButton = document.createElement("button");

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
    statusItem.innerText = statusString(listItem.data.status) || " ";
    statusItem.className = "itemText";
    statusItem.id = listItem.data.order.toString() || " ";

    printDiv.appendChild(printButton);
    printDiv.className = "itemInfo";
    printButton.onclick = () => {
        console.log(listItemData.order);
        sendPrint(listItemData.order);
    };
    printButton.className = "itemText";
    printButton.innerText = "print";
    printButton.style.marginRight = "3px";

    printDiv.appendChild(nextStepButton);
    printDiv.className = "itemInfo";
    nextStepButton.onclick = () => {
        ws.send(JSON.stringify({
            method: Method.NEXT_STAGE,
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
    previousStageButton.onclick = () => {
        ws.send(JSON.stringify({
            method: Method.PREVIOUS_STAGE,
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

    for(let i = 0; i < listItemData.products.length; i++) {
        let listItem = listItemData.products[i];

        let newItem = document.createElement("div");
        newItem.style.maxHeight = "22px";
        newItem.className = "item";

        let emptyDiv = document.createElement("div");
        let emptyItem = document.createElement("a");
        let nameDiv = document.createElement("div");
        let nameItem = document.createElement("a");
        let descriptionDiv = document.createElement("div");
        let descriptionItem = document.createElement("a");
        let amountDiv = document.createElement("div");
        let amountItem = document.createElement("a");
        let aDiv = document.createElement("div");
        let aItem = document.createElement("a");
        let bDiv = document.createElement("div");
        let bItem = document.createElement("a");

        emptyDiv.appendChild(emptyItem);
        emptyDiv.className = "itemInfo";
        emptyItem.innerText = " ";
        emptyItem.className = "itemText";

        nameDiv.appendChild(nameItem);
        nameDiv.className = "itemInfo";
        nameItem.innerText = listItem["name"] || " ";
        nameItem.className = "itemText";

        descriptionDiv.appendChild(descriptionItem);
        descriptionDiv.className = "itemInfo";
        descriptionItem.innerText = listItem["description"] || " ";
        descriptionItem.className = "itemText";

        amountDiv.appendChild(amountItem);
        amountDiv.className = "itemInfo";
        amountItem.innerText = listItem.amount.toString() || " ";
        amountItem.className = "itemText";

        aDiv.appendChild(aItem);
        aDiv.className = "itemInfo";
        aItem.className = "itemText";
        aItem.innerText = " "

        bDiv.appendChild(bItem);
        bDiv.className = "itemInfo";
        bItem.className = "itemText";
        bItem.innerText = " "

        newItem.appendChild(emptyDiv);
        newItem.appendChild(nameDiv);
        newItem.appendChild(descriptionDiv);
        newItem.appendChild(amountDiv);
        newItem.appendChild(aDiv);
        newItem.appendChild(bDiv);

        items.appendChild(newItem);
    }
}

ws.addEventListener("message", (data) => {
    let dataPackage: TranssmisionPackage = JSON.parse(data.data);
    console.log(dataPackage);
    let receivedPackageData = dataPackage.data;
    if(dataPackage.method === Method.UPDATE_ORDERS){
        //createItem(receivedPackageData);
    }
    else if(dataPackage.method === Method.LIST){
        for(let i = 0; i < receivedPackageData["list"].length; i++){
            let listItem = receivedPackageData["list"][i];
            if(listItem.method === Method.UPDATE_ORDERS){
                createItem(listItem);
            }
        }
    }
    else if(dataPackage.method === Method.INFO){
        info.innerText = dataPackage["data"]["text"];
    }
    else if(dataPackage.method === Method.REDIRECT){
        window.location.href = dataPackage["data"]["page"];
    }
    else if(dataPackage.method === Method.UPDATE_ORDER){
        document.getElementById(dataPackage.data.order.toString()).innerText = statusString(dataPackage.data.status);
    }
});

ws.addEventListener("open", () => {
    if(!accessToken){
        setTimeout(() => {
            if(!accessToken){
                console.log("Cant access accessToken cookie")
            }else {
                ws.send(JSON.stringify({
                    method: Method.IDENTIFIER,
                    data: {
                        listener: "newOrder",
                        accessToken: accessToken
                    }
                }));
            }
        }, 1000);
    }else{
        ws.send(JSON.stringify({
            method: Method.IDENTIFIER,
            data: {
                listener: "newOrder",
                accessToken: accessToken
            }
        }))
    }
});
ws.addEventListener("close", () => {

})

const sendPrint = (order) => {
    ws.send(JSON.stringify({
        method: Method.PRINT,
        data: {
            order: order,
            accessToken: accessToken
        }
    }))
}

// @ts-ignore
window.logout = () => {
    ws.send(JSON.stringify({
        method: Method.LOGOUT,
        data: {
            accessToken: accessToken
        }
    }));
    Cookies.remove("accessToken");
}