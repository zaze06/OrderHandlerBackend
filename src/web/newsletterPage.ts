import {Method} from "../app/packages/method";
import {TranssmisionPackage} from "../app/packages/transsmisionPackage";
import * as Cookies from "js-cookie";


const ws = new WebSocket("wss://api.lassehjalpen.se");

let subject = document.getElementById("subject");
let message = document.getElementById("message");
let info = document.getElementById("info");
let send = document.getElementById("send")
let accessToken = Cookies.get("accessToken");

ws.addEventListener("open", () => {

});

ws.addEventListener("message", (data) => {
    let dataPackage: TranssmisionPackage = JSON.parse(data.data);

    if(dataPackage.method === Method.INFO){
        info.innerText = dataPackage["data"]["text"];
    }
    else if(dataPackage.method === Method.REDIRECT){
        window.location.href = dataPackage["data"]["page"];
    }
});

send.onclick = () => {
    // @ts-ignore
    let subject1 = subject.value;
    // @ts-ignore
    let email = message.value;

    let data: TranssmisionPackage = {
        method: Method.NEWSLETTER_SEND,
        data: {
            accessToken: accessToken,
            newsletter: {
                subject: subject1,
                email: email
            }
        }
    }
    ws.send(JSON.stringify(data))
}