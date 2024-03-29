import {TranssmisionPackage} from "../app/packages/transsmisionPackage";
import {Method} from "../app/packages/method";
import * as Cookies from "js-cookie";

let ws: WebSocket = new WebSocket("wss://orders.lassehjalpen.se"); // orders.lassehjalpen.se

let errorMessage = document.getElementById('error-message');


let lang = document.location.href.split("/")[3];

ws.addEventListener("error", console.error);
ws.addEventListener("message", (data) => {
    let dataPackage: TranssmisionPackage = JSON.parse(data.data);
    if(dataPackage.method === Method.AUTHORISED){
        Cookies.set("accessToken", dataPackage.data.accessToken, {
            expires: dataPackage.data.expirationDate,
            path: "/",
            domain: "lassehjalpen.se",
            sameSite: "None",
            secure: true
        });
        window.location.href = dataPackage.data.page;
    }else if(dataPackage.method === Method.REDIRECT){
        window.location.href = dataPackage.data.page;
    }else if(dataPackage.method === Method.LOGIN_ERROR){
        errorMessage.style.display = 'block';
    }
});
ws.addEventListener("open", () => {
});
ws.addEventListener("close", () => {
})

document.getElementById('loginForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    const username = (document.getElementById('email') as HTMLInputElement).value;

    // Hash the password using the Web Crypto API
    const encoder = new TextEncoder();

    const hashedBuffer = await crypto.subtle.digest('SHA-256', encoder.encode((document.getElementById('password') as HTMLInputElement).value));

    // Convert the hashed buffer to a hex string
    const password = Array.from(new Uint8Array(hashedBuffer))
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join('');

    // Log the hashed password (for demonstration purposes)
    //console.log(`Username: ${username}, Hashed Password: ${hashedPassword}`);

    ws.send(JSON.stringify({
        method: Method.LOGIN,
        data: {
            username: username,
            password: password
        }
    }))

    // Now you can send the username and hashed password to the server
    // (Remember to use HTTPS for secure transmission)
});

// @ts-ignore
window.logoutButton = () => {
    let loginForm: HTMLFormElement = document.querySelector('.login-form');
    loginForm.style.display = (loginForm.style.display === "none" || loginForm.style.display === "") ? "block" : "none";
}

let searchBar: HTMLInputElement = document.getElementById("orderSearch") as HTMLInputElement;

let regexp = /^#[0-9]{4,}$/;

searchBar.addEventListener("keydown", (evt) => {
    if((evt.key === "Enter" || evt.key === "\n") && searchBar.value.match(regexp)){
        ws.send(JSON.stringify({
            method: Method.ORDER,
            data: {
                lang: lang,
                orderID: searchBar.value
            }
        }))
    }
})

searchBar.addEventListener("input", (evt) => {
    if(searchBar.value.match(regexp)){
        searchBar.style.backgroundColor = "#3b3b3b";
    }else{
        searchBar.style.backgroundColor = "#720505";
    }
})
