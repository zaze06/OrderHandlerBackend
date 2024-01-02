import * as https from "https";
import {ServerResponse} from "http";
import * as fs from "fs";
import {SecureServerOptions} from "http2";
import {WebSocket, WebSocketServer} from "ws";
import * as net from "net";
import {sessions} from "./sessions";
import {TranssmisionPackage} from "./packages/transsmisionPackage";
import {Method} from "./packages/method";
import {Listener} from "./packages/listener";

const options: SecureServerOptions = {
    key: fs.readFileSync("./cert/privkey.pem"),//fs.readFileSync("./cert/key.pem"),
    cert: fs.readFileSync("./cert/fullchain.pem"),//fs.readFileSync("./cert/cert.pem"),
}

const socket = new net.Socket();

const waitingAuthorisation: WebSocket[] = [];
const newOrderListeners: {id: string, ws: WebSocket}[] = [];
const orderInfoWaiter: WebSocket[] = [];

let orderIDRegex = /^#[0-9]{4,}$/;
let orderRegex = /^[0-9]{4,}$/;

const server = https.createServer(options, (req, res: ServerResponse) => {
    //console.log("req.url: "+req.url)
    let cookies = parseCookies(req.headers.cookie)
    if(req.url === "/") {
        if(sessions.validateSession(cookies["accessToken"])){
            res.writeHead(302, { 'Location': '/orderlist' });
            res.end();
        }else {
            fs.readFile("./web/HomePage.html", (err, data) => {
                if (err) {
                    res.statusCode = 404;
                    res.setHeader("Content-Type", "text/raw");
                    res.end("404 not found!");
                    return;
                }
                res.statusCode = 200;
                res.setHeader("Content-Type", "text/html");
                res.end(data);
            });
        }
    }else if(req.url === "/orderlist"){
        let username = sessions.getUsername(cookies["accessToken"]);
        if(username){
            fs.readFile("./web/orderList.html", (err, data) => {
                if (err) {
                    res.statusCode = 404;
                    res.setHeader("Content-Type", "text/raw");
                    res.end("404 not found!");
                    return;
                }
                res.statusCode = 200;
                res.setHeader("Content-Type", "text/html");
                res.end(data.toString().replace("<!--USERNAME-->", username));
            });
        }else{
            res.setHeader("Content-Type", "text/html");
            res.writeHead(302, { 'Location': '/' });
            // Handeling when the user isent loged in or has en expired accessToken
            res.end(`
<html>
<head>
<title>Order List</title>
</head>
<body>
Your not logged in! Redirecting to <a href="/">Home page</a>
</body>
</html>
`);
        }
    }
    //<editor-fold desc="Favicons">
    //#region Favicons
    else if(req.url === "/apple-touch-icon.png"){
        fs.readFile("./icons/apple-touch-icon.png", (err, data) => {
            if(err){
                res.statusCode = 404;
                res.end();
                return;
            }
            res.statusCode = 200;
            res.end(data);
        })
    }
    else if(req.url === "/favicon-32x32.png"){
        fs.readFile("./icons/favicon-32x32.png", (err, data) => {
            if(err){
                res.statusCode = 404;
                res.end();
                return;
            }
            res.statusCode = 200;
            res.end(data);
        })
    }
    else if(req.url === "/favicon-16x16.png"){
        fs.readFile("./icons/favicon-16x16.png", (err, data) => {
            if(err){
                res.statusCode = 404;
                res.end();
                return;
            }
            res.statusCode = 200;
            res.end(data);
        })
    }
    else if(req.url === "/site.webmanifest"){
        fs.readFile("./icons/site.webmanifest", (err, data) => {
            if(err){
                res.statusCode = 404;
                res.end();
                return;
            }
            res.statusCode = 200;
            res.end(data);
        })
    }
    else if(req.url === "/mstile-150x150.png"){
        fs.readFile("./icons/mstile-150x150.png", (err, data) => {
            if(err){
                res.statusCode = 404;
                res.end();
                return;
            }
            res.statusCode = 200;
            res.end(data);
        })
    }
    else if(req.url === "/android-chrome-192x192.png"){
        fs.readFile("./icons/android-chrome-192x192.png", (err, data) => {
            if(err){
                res.statusCode = 404;
                res.end();
                return;
            }
            res.statusCode = 200;
            res.end(data);
        })
    }
    else if(req.url === "/android-chrome-384x384.png"){
        fs.readFile("./icons/android-chrome-384x384.png", (err, data) => {
            if(err){
                res.statusCode = 404;
                res.end();
                return;
            }
            res.statusCode = 200;
            res.end(data);
        })
    }
    else if(req.url === "/favicon.ico"){
        fs.readFile("./icons/favicon.ico", (err, data) => {
            if(err){
                res.statusCode = 404;
                res.end();
                return;
            }
            res.statusCode = 200;
            res.end(data);
        })
    }
    else if(req.url === "/browserconfig.xml"){
        fs.readFile("./icons/browserconfig.xml", (err, data) => {
            if(err){
                res.statusCode = 404;
                res.end();
                return;
            }
            res.statusCode = 200;
            res.end(data);
        })
    }
    //#endregion
    //</editor-fold>
    else if(req.url.substring(1).match(orderIDRegex)){
        res.writeHead(302, { 'Location': req.url.replace("#", "") });
        res.end();
    }else if(req.url.substring(1).match(orderRegex)){
        fs.readFile("./web/orderPage.html", (err, data) => {
            if(err){
                res.statusCode = 404;
                res.end();
                return;
            }
            res.statusCode = 200;
            res.setHeader("Content-Type", "text/html");
            res.end(data.toString().replace(/<!--OrderNumber-->/g, "#"+req.url.substring(1)));
        })
    }
    else if(req.url === "/HomePage.js"){
        fs.readFile("./web/HomePage.js", (err, data) => {
            if(err){
                res.statusCode = 404;
                res.end();
                return;
            }

            res.statusCode = 200;
            res.setHeader("Content-Type", "application/javascript");
            res.end(data);
        })
    }
    else if(req.url === "/orderList.js"){
        fs.readFile("./web/orderList.js", (err, data) => {
            if(err){
                res.statusCode = 404;
                res.end();
                return;
            }

            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.end(data);
        })
    }
    else{
        res.writeHead(302, { 'Location': '/' });
        res.end();
    }
});

const wss = new WebSocketServer({server});

socket.connect(5738, "localhost", () => {
    console.log("Connected to server");
});

socket.on("data", (data) => {
    const dataPackage: TranssmisionPackage = JSON.parse(data.toString());
    //console.log(dataPackage);
    switch (dataPackage.method) {
        case Method.AUTHORISED: {
            let index = dataPackage.data.client;
            let ws: WebSocket = waitingAuthorisation[index];
            if (ws) {
                waitingAuthorisation.splice(index, 1);
                if (dataPackage.data.valid) {
                    sendToWS({
                        method: Method.AUTHORISED,
                        data: {
                            page: "/orderlist",
                            accessToken: sessions.createNewSession(dataPackage.data.username).id
                        }
                    }, ws);
                }
            }
            break;
        }

        case Method.REQUEST_ORDERS: {
            let client = newOrderListeners[dataPackage.data.client];
            if (client) {
                sendToWS({
                    method: Method.LIST,
                    data: {
                        list: dataPackage.data.list,
                        method: Method.UPDATE_ORDERS
                    }
                }, client.ws);
            }
            break;
        }

        case Method.UPDATE_ORDERS: {
            for (let client of newOrderListeners) {
                if (sessions.validateSession(client.id)) {
                    sendToWS(dataPackage, client.ws);
                } else {
                    sendToWS({
                        method: Method.INFO,
                        data: {
                            text: "Your session is no longer valid"
                        }
                    }, client.ws);
                }
            }
            break;
        }

        case Method.LIST: {
            if (dataPackage.data.method === Method.UPDATE_ORDERS) {
                for (let client of newOrderListeners) {
                    if (sessions.validateSession(client.id)) {
                        sendToWS(dataPackage, client.ws);
                    } else {
                        sendToWS({
                            method: Method.INFO,
                            data: {
                                text: "Your session is no longer valid"
                            }
                        }, client.ws);
                    }
                }
            }
            break;
        }

        case Method.ORDER_INFO: {
            let index = dataPackage.data.client;
            let webSocket = orderInfoWaiter[index];
            if(webSocket){
                orderInfoWaiter.splice(index, 1);
                sendToWS({
                    method: Method.ORDER_INFO,
                    data: {
                        orderInfo: {
                            status: dataPackage.data.orderInfo.status
                        }
                    }
                }, webSocket);
            }
        }

        default: {
            // Handle the default case if none of the above conditions match
        }
    }
});

socket.on("error", (err) => {
    console.error(err);
});

function sendToSocket(sendPackage: TranssmisionPackage) {
    socket.write(JSON.stringify(sendPackage) + "\n");
}

function parseCookies(cookieHeader: string | undefined): Record<string, string> {
    const cookies: Record<string, string> = {};
    if (cookieHeader) {
        cookieHeader.split(';').forEach(cookie => {
            const [key, value] = cookie.split('=').map(part => part.trim());
            cookies[key] = value;
        });
    }
    return cookies;
}

wss.on("connection", (ws) => {
    //console.log("client connected")
    ws.on("error", console.error);

    ws.on("message", (data) => {
        let receivedPackage: TranssmisionPackage = JSON.parse(data.toString());
        console.log(receivedPackage)
        switch (receivedPackage.method) {
            case Method.CHECK: {
                if(receivedPackage.data.accessToken && sessions.validateSession(receivedPackage.data.accessToken)){
                    sendToWS({
                        method: Method.REDIRECT,
                        data: {
                            page: "/orderlist"
                        }
                    }, ws);
                }
                break;
            }
            case Method.LOGIN: {
                waitingAuthorisation[waitingAuthorisation.length] = ws;
                const sendPackage: TranssmisionPackage = {
                    method: Method.AUTHORISE,
                    data: {
                        password: receivedPackage.data.password,
                        username: receivedPackage.data.username,
                        client: waitingAuthorisation.length-1
                    }
                }
                sendToSocket(sendPackage);
                break;
            }
            case Method.IDENTIFIER: {
                if(receivedPackage.data.listener === Listener.NEW_ORDER){
                    if(!sessions.validateSession(receivedPackage.data.accessToken)){
                        sendToWS({
                            method: Method.REDIRECT,
                            data: {
                                page: "/"
                            }
                        }, ws);
                        break;
                    }
                    newOrderListeners[newOrderListeners.length] = {
                        id: receivedPackage.data.accessToken,
                        ws: ws
                    }
                    sendToSocket({
                        method: Method.REQUEST_ORDERS,
                        data: {
                            client: newOrderListeners.length-1
                        }
                    })
                }
                break;
            }
            case Method.PRINT: {
                if(!sessions.validateSession(receivedPackage.data.accessToken)){
                    sendToWS({
                        method: Method.REDIRECT,
                        data: {
                            page: "/"
                        }
                    }, ws);
                    break;
                }
                sendToSocket({
                    method: Method.PRINT,
                    data: {
                        order: receivedPackage.data.order
                    }
                });
                break;
            }
            case Method.ORDER: {
                if(receivedPackage.data.orderID.match(orderIDRegex) || receivedPackage.data.orderID.match(orderRegex)){
                    let dataPackage = {
                        method: Method.REDIRECT,
                        data: {
                            page: "/"+receivedPackage.data.orderID.replace("#", "")
                        }
                    };
                    console.log(dataPackage);
                    sendToWS(dataPackage, ws);
                }
                break;
            }
            case Method.LOGOUT: {
                sessions.removeSession(receivedPackage.data.accessToken);
                sendToWS({
                    method: Method.REDIRECT,
                    data: {
                        page: "/"
                    }
                }, ws);
                break;
            }
            case Method.ORDER_INFO: {
                orderInfoWaiter[orderInfoWaiter.length] = ws;
                sendToSocket({
                    method: Method.ORDER_INFO,
                    data: {
                        order: receivedPackage.data.order,
                        client: orderInfoWaiter.length -1
                    }
                });
            }
        }
    });
})

function sendToWS(dataPackage: TranssmisionPackage, ws: WebSocket) {
    ws.send(JSON.stringify(dataPackage));
}

server.listen(443, "0.0.0.0", () => {
    console.log("listening on https://192.168.5.184:443");
    console.log("and on https://orders.lassehjalpen.se:443");
});