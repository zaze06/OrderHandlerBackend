import {Method} from "../app/packages/method";
import * as Cookies from "js-cookie";

let ws = new WebSocket("wss://admin.lassehjalpen.se");

let accessToken = Cookies.get("accessToken");

// @ts-ignore
window.newsletterButton = () => {
    window.location.href = "/newsletter"
}

// @ts-ignore
window.orderListButton = () => {
    window.location.href = "/orderList"
}

// @ts-ignore
window.logoutButton = () => {
    console.log("opening logout");
    ws.send(JSON.stringify({
        method: Method.LOGOUT,
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
}