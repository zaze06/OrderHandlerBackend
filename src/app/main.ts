import * as https from "https";
import {ServerResponse} from "http";
import * as fs from "fs";
import {SecureServerOptions} from "http2";
import {WebSocket, WebSocketServer} from "ws";
import {sessions} from "./sessions";
import {TranssmisionPackage} from "./packages/transsmisionPackage";
import {Method} from "./packages/method";
import {Listener} from "./packages/listener";
import {OneWebShopApplication} from "../onlineStore/oneWebShopApplication";
import {AdminPanelHandler} from "../adminPanel/AdminPanelHandler";
import {NewsletterHandler} from "../newsletterHandler/newsletterHandler";
import {Product} from "./packages/product";
import {HttpStatusCode} from "axios";
import * as httpProxy from "http-proxy";

const options: SecureServerOptions = {
    key: fs.readFileSync("/etc/letsencrypt/live/orders.lassehjalpen.se/privkey.pem"),//fs.readFileSync("./cert/key.pem"),
    cert: fs.readFileSync("/etc/letsencrypt/live/orders.lassehjalpen.se/fullchain.pem"),//fs.readFileSync("./cert/cert.pem"),
}

//const socket = new net.Socket();

const proxy = httpProxy.createProxyServer();

const waitingAuthorisation: WebSocket[] = [];
const newOrderListeners: {id: string, ws: WebSocket}[] = [];
const orderInfoWaiter: WebSocket[] = [];

let orderIDRegex = /^#[0-9]{4,}$/;
let orderRegex = /^[0-9]{4,}$/;

const adminPanelHandler = new AdminPanelHandler();
const newsletterHandler = new NewsletterHandler();
const oneWebShopApplication = new OneWebShopApplication(adminPanelHandler, newsletterHandler);

const server = https.createServer(options, (req, res: ServerResponse) => {
    //console.log("req.url: "+req.url);
    let cookies = parseCookies(req.headers.cookie)
    const host = req.headers.host;
    console.log(host);

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, POST, GET');
    res.setHeader('Access-Control-Allow-Headers', '*');

    if(req.method == 'OPTIONS'){
        res.statusCode = HttpStatusCode.Ok
        res.end();
        return;
    }

    if(host === "shop.lassehjalpen.se"){
        proxy.web(req, res, {target: 'https://localhost:4885'})
    }else
    if(host === "api.lassehjalpen.se"){
        oneWebShopApplication.receive(req, res).then(r => null);
    }else
    if(host === "admin.lassehjalpen.se"){
        adminPanelHandler.receive(req, res);
    }else
        if(req.method == 'GET') {
            if (req.url === "/") {
                if (sessions.validateSession(cookies["accessToken"])) {
                    res.writeHead(302, {'Location': 'https://admin.lassehjalpen.se'});
                    res.end();
                } else {
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
            } else if (req.url.toLowerCase() === "/orderlist" || req.url.toLowerCase() === "/orderlist.html") {
                let username = sessions.getUsername(cookies["accessToken"]);
                if (username) {
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
                } else {
                    res.writeHead(302, {'Location': '/'});
                    res.end()
                }
            }
            //<editor-fold desc="Favicons">
            //#region Favicons
            else if (req.url === "/apple-touch-icon.png") {
                fs.readFile("./icons/apple-touch-icon.png", (err, data) => {
                    if (err) {
                        res.statusCode = 404;
                        res.end();
                        return;
                    }
                    res.statusCode = 200;
                    res.end(data);
                })
            } else if (req.url === "/favicon-32x32.png") {
                fs.readFile("./icons/favicon-32x32.png", (err, data) => {
                    if (err) {
                        res.statusCode = 404;
                        res.end();
                        return;
                    }
                    res.statusCode = 200;
                    res.end(data);
                })
            } else if (req.url === "/favicon-16x16.png") {
                fs.readFile("./icons/favicon-16x16.png", (err, data) => {
                    if (err) {
                        res.statusCode = 404;
                        res.end();
                        return;
                    }
                    res.statusCode = 200;
                    res.end(data);
                })
            } else if (req.url === "/site.webmanifest") {
                fs.readFile("./icons/site.webmanifest", (err, data) => {
                    if (err) {
                        res.statusCode = 404;
                        res.end();
                        return;
                    }
                    res.statusCode = 200;
                    res.end(data);
                })
            } else if (req.url === "/mstile-150x150.png") {
                fs.readFile("./icons/mstile-150x150.png", (err, data) => {
                    if (err) {
                        res.statusCode = 404;
                        res.end();
                        return;
                    }
                    res.statusCode = 200;
                    res.end(data);
                })
            } else if (req.url === "/android-chrome-192x192.png") {
                fs.readFile("./icons/android-chrome-192x192.png", (err, data) => {
                    if (err) {
                        res.statusCode = 404;
                        res.end();
                        return;
                    }
                    res.statusCode = 200;
                    res.end(data);
                })
            } else if (req.url === "/android-chrome-384x384.png") {
                fs.readFile("./icons/android-chrome-384x384.png", (err, data) => {
                    if (err) {
                        res.statusCode = 404;
                        res.end();
                        return;
                    }
                    res.statusCode = 200;
                    res.end(data);
                })
            } else if (req.url === "/favicon.ico") {
                fs.readFile("./icons/favicon.ico", (err, data) => {
                    if (err) {
                        res.statusCode = 404;
                        res.end();
                        return;
                    }
                    res.statusCode = 200;
                    res.end(data);
                })
            } else if (req.url === "/browserconfig.xml") {
                fs.readFile("./icons/browserconfig.xml", (err, data) => {
                    if (err) {
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
            else if (req.url.substring(1).match(orderIDRegex)) {
                res.writeHead(302, {'Location': req.url.replace("#", "")});
                res.end();
            } else if (req.url.startsWith("/orderinfo")) {
                fs.readFile("./web/orderPage.html", (err, data) => {
                    if (err) {
                        res.statusCode = 404;
                        res.end();
                        return;
                    }
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "text/html");
                    res.end(data.toString());
                })
            } else if (req.url === "/HomePage.js") {
                fs.readFile("./web/HomePage.js", (err, data) => {
                    if (err) {
                        res.statusCode = 404;
                        res.end();
                        return;
                    }

                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/javascript");
                    res.end(data);
                })
            } else if (req.url === "/orderList.js") {
                fs.readFile("./web/orderList.js", (err, data) => {
                    if (err) {
                        res.statusCode = 404;
                        res.end();
                        return;
                    }

                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/javascript");
                    res.end(data);
                })
            } else if (req.url === "/orderPage.js") {
                fs.readFile("./web/orderPage.js", (err, data) => {
                    if (err) {
                        res.statusCode = 404;
                        res.end();
                        return;
                    }

                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/javascript");
                    res.end(data);
                })
            } else if (req.url === "/newsletter.js") {
                fs.readFile("./web/newsletter.js", (err, data) => {
                    if (err) {
                        res.statusCode = 404;
                        res.end();
                        return;
                    }

                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/javascript");
                    res.end(data);
                })
            } else {
                res.writeHead(302, {'Location': 'https://lassehjalpen.se'});
                res.end();
            }
        }else{
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Not Found');
        }
});

const wss = new WebSocketServer({server});

/*
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
                            page: "https://admin.lassehjalpen.se",
                            accessToken: sessions.createNewSession(dataPackage.data.username).id,
                            expirationDate: Date.now() + 14400000// 4hours in milliseconds
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
                    data: dataPackage.data
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
                        status: dataPackage.data.status
                    }
                }, webSocket);
            }
            break;
        }

        case Method.UPDATE_ORDER: {
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
    }
});
*/
//socket.on("error", (err) => {
//    console.error(err);
//});

//function sendToSocket(sendPackage: TranssmisionPackage) {
//    socket.write(JSON.stringify(sendPackage) + "\n");
//}

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

    ws.on("message", async (data) => {
        let receivedPackage: TranssmisionPackage = JSON.parse(data.toString());
        console.log(receivedPackage)
        switch (receivedPackage.method) {
            case Method.CHECK: {
                if (receivedPackage.data.accessToken && sessions.validateSession(receivedPackage.data.accessToken)) {
                    sendToWS({
                        method: Method.REDIRECT,
                        data: {
                            page: "https://admin.lassehjalpen.se"
                        }
                    }, ws);
                }
                break;
            }
            case Method.LOGIN: {
                let auth = sessions.createNewSession(receivedPackage.data.username, receivedPackage.data.password);
                if(auth){
                    sendToWS({
                        method: Method.AUTHORISED,
                        data: {
                            page: "https://admin.lassehjalpen.se",
                            accessToken: auth.id,
                            expirationDate: Date.now() + 14400000// 4hours in milliseconds
                        }
                    }, ws);
                }
                break;
            }
            case Method.IDENTIFIER: {
                if (receivedPackage.data.listener === Listener.NEW_ORDER) {
                    if (!sessions.validateSession(receivedPackage.data.accessToken)) {
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
                    /*sendToSocket({
                        method: Method.REQUEST_ORDERS,
                        data: {
                            client: newOrderListeners.length - 1
                        }
                    });*/

                    let transsmisionPackageHost: TranssmisionPackage = {
                        method: Method.UPDATE_ORDERS,
                        data: {}
                    }

                    let items: TranssmisionPackage[] = [];

                    for (let order of await adminPanelHandler.getAllOrder()){

                        let products: Product[] = [];

                        for(let product of order.data.orderItems){
                            products[products.length] = {
                                name: product.productName,
                                amount: product.quantity,
                                description: product.optionValues.join(", ")
                            }
                        }

                        items[items.length] = {
                            method: Method.UPDATE_ORDERS,
                            data: {
                                order: order.data.number,
                                products: products,
                                information: {
                                    email: order.data.email,
                                    name: order.data.shippingAddress.firstName + " " + order.data.shippingAddress.lastName
                                },
                                status: adminPanelHandler.rawStatus(order.data.number, order.data.id)

                            }
                        }
                    }

                    transsmisionPackageHost.method = Method.LIST;
                    transsmisionPackageHost.data.list = items;

                    sendToWS(transsmisionPackageHost, ws);
                }
                break;
            }
            case Method.PRINT: {
                if (!sessions.validateSession(receivedPackage.data.accessToken)) {
                    sendToWS({
                        method: Method.REDIRECT,
                        data: {
                            page: "/"
                        }
                    }, ws);
                    break;
                }

                adminPanelHandler.createPDF(receivedPackage.data.order, (pdf) => {

                });

                break;
            }
            case Method.ORDER: {
                if (receivedPackage.data.orderID.match(orderIDRegex) || receivedPackage.data.orderID.match(orderRegex)) {
                    let dataPackage = {
                        method: Method.REDIRECT,
                        data: {
                            page: "/" + receivedPackage.data.lang + "/orderinfo?order=" + receivedPackage.data.orderID.replace("#", "")
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
                sendToWS({
                    method: Method.ORDER_INFO,
                    data: {
                        order: receivedPackage.data.order,
                        status: adminPanelHandler.rawStatus(receivedPackage.data.order)
                    }
                }, ws);
                break
            }
            case Method.NEXT_STAGE: {
                if (!sessions.validateSession(receivedPackage.data.accessToken)) {
                    sendToWS({
                        method: Method.REDIRECT,
                        data: {
                            page: "/"
                        }
                    }, ws);
                    break;
                }
                adminPanelHandler.nextStatus(receivedPackage.data.order);

                for (let client of newOrderListeners) {
                    if (sessions.validateSession(client.id)) {
                        sendToWS({
                            method: Method.UPDATE_ORDER,
                            data: {
                                order: receivedPackage.data.order,
                                status: adminPanelHandler.rawStatus(receivedPackage.data.order)
                            }
                        }, client.ws);
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
            case Method.PREVIOUS_STAGE: {
                if (!sessions.validateSession(receivedPackage.data.accessToken)) {
                    sendToWS({
                        method: Method.REDIRECT,
                        data: {
                            page: "/"
                        }
                    }, ws);
                    break;
                }
                adminPanelHandler.previousStatus(receivedPackage.data.order);

                for (let client of newOrderListeners) {
                    if (sessions.validateSession(client.id)) {
                        sendToWS({
                            method: Method.UPDATE_ORDER,
                            data: {
                                order: receivedPackage.data.order,
                                status: adminPanelHandler.rawStatus(receivedPackage.data.order)
                            }
                        }, client.ws);
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
            case Method.NEWSLETTER_SEND: {
                if (!sessions.validateSession(receivedPackage.data.accessToken)) {
                    sendToWS({
                        method: Method.REDIRECT,
                        data: {
                            page: "/"
                        }
                    }, ws);
                    break;
                }
                newsletterHandler.sendMail(receivedPackage.data.newsletter.email, receivedPackage.data.newsletter.subject);
                break;
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
    console.log("and on https://admin.lassehjalpen.se:443");
    console.log("and on https://api.lassehjalpen.se:443");
});