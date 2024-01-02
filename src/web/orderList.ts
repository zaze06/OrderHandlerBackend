import {Cookies} from "./api/cookies";

let accessToken = Cookies.get("accessToken").value;
let ws = new WebSocket("wss://orders.lassehjalpen.se:443"); //
let items = document.getElementById("items");
let info = document.getElementById("info");
let orders = [];

ws.addEventListener("error", console.error);

function createItem(listItem) {
    let listItemData = listItem["data"];

    if(orders[listItemData["order"]]) return;
    orders[listItemData["order"]] = true;

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
    let printDiv = document.createElement("div");
    let printButton = document.createElement("button");

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
    printButton.onclick = () => {
        console.log(listItemData["order"]);
        sendPrint(listItemData["order"]);
    };
    printButton.className = "itemText";
    printButton.innerText = "print"

    newItem.appendChild(orderDiv);
    newItem.appendChild(nameDiv);
    newItem.appendChild(emailDiv);
    newItem.appendChild(aDiv);
    newItem.appendChild(printDiv);

    items.appendChild(newItem);

    for(let i = 0; i < listItemData["products"].length; i++) {
        let listItem = listItemData["products"][i];

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
        amountItem.innerText = listItem["amount"] || " ";
        amountItem.className = "itemText";

        aDiv.appendChild(aItem);
        aDiv.className = "itemInfo";
        aItem.className = "itemText";
        aItem.innerText = " "

        newItem.appendChild(emptyDiv);
        newItem.appendChild(nameDiv);
        newItem.appendChild(descriptionDiv);
        newItem.appendChild(amountDiv);
        newItem.appendChild(aDiv);

        items.appendChild(newItem);
    }
}

ws.addEventListener("message", (data) => {
    let dataPackage = JSON.parse(data.data);
    console.log(dataPackage);
    let receivedPackageData = dataPackage["data"];
    if(dataPackage["method"] === "UPDATE_ORDERS"){
        createItem(receivedPackageData);
    }
    else if(dataPackage["method"] === "LIST"){
        for(let i = 0; i < receivedPackageData["list"].length; i++){
            let listItem = receivedPackageData["list"][i];
            if(listItem["method"] === "UPDATE_ORDERS"){
                createItem(listItem);
            }
        }
    }
    else if(dataPackage["method"] === "info"){
        info.innerText = dataPackage["data"]["text"];
    }
    else if(dataPackage["method"] === "REDIRECT"){
        window.location.href = dataPackage["data"]["page"];
    }
});

ws.addEventListener("open", () => {
    if(!accessToken){
        setTimeout(() => {
            if(!accessToken){
                console.log("Cant access accessToken cookie")
            }else {
                ws.send(JSON.stringify({
                    method: "IDENTIFIER",
                    data: {
                        listener: "newOrder",
                        accessToken: accessToken
                    }
                }));
            }
        }, 1000);
    }else{
        ws.send(JSON.stringify({
            method: "IDENTIFIER",
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
        method: "PRINT",
        data: {
            order: order,
            accessToken: accessToken
        }
    }))
}

// @ts-ignore
window.logout = () => {
    ws.send(JSON.stringify({
        method: "LOGOUT",
        data: {
            accessToken: accessToken
        }
    }));
    Cookies.remove("accessToken");
}