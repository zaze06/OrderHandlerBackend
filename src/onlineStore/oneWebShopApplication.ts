import {IncomingMessage, ServerResponse} from "http";
import * as https from "https";
import * as URL from "url";
import * as jwt from 'jsonwebtoken';
import axios, {AxiosResponse, HttpStatusCode} from "axios";
import * as fs from "fs";
import {randomUUID} from "crypto";
import * as querystring from "querystring";
import {AdminPanelHandler} from "../adminPanel/AdminPanelHandler";
import {GET, POST} from "../webHandler/WebHandler";
import {NewsletterHandler} from "../newsletterHandler/newsletterHandler";

type ApiConfig = {
    clientID: string,
    clientSecret: string,
    auth: string,
    users: {[key: string]: string}
}

type Webhook = {
    "id": string,
    "shopId": string,
    "webhookUrl": string,
    "eventType": string,
    "eventName": string,
    "status": string,
    "meta": {[key: string]: string},
    "created": string,
    "modified": string
}

export class OneWebShopApplication {

    private config: ApiConfig = JSON.parse(fs.readFileSync("./config/api.json").toString())

    private readonly clientID = this.config.clientID;
    private readonly clientSecret = this.config.clientSecret;

    private auth: string = this.config.auth;
    
    private webhooks: Webhook[];

    private adminPanelHandler: AdminPanelHandler;
    private newsletterHandler: NewsletterHandler;

    constructor(adminPanelHandler: AdminPanelHandler, newsletterHandler: NewsletterHandler) {
        this.adminPanelHandler = adminPanelHandler;
        this.newsletterHandler = newsletterHandler;

        GET("https://webshop.one.com/api/v2/webhooks", this.auth, (response) => {
            if(response.status == 200){
                this.webhooks = response.data;

                let hasOrder, hasCreated, hasPaid;

                this.webhooks.forEach((webhook) => {
                    console.log(webhook)
                    if(webhook.eventName == "CREATED"){
                        hasCreated = true;
                    }
                    if(webhook.eventType == "ORDER"){
                        hasOrder = true;
                    }
                });

                if(!(hasCreated && hasOrder)){
                    this.createWebhook(this.auth, "CREATED");
                    console.log("created webhook");
                }else{
                    console.log("webhook already exist");
                }

                hasOrder = false;

                this.webhooks.forEach((webhook) => {
                    console.log(webhook)
                    if(webhook.eventName == "PAID"){
                        hasPaid = true;
                    }
                    if(webhook.eventType == "ORDER"){
                        hasOrder = true;
                    }
                });

                if(!(hasPaid && hasOrder)){
                    this.createWebhook(this.auth, "PAID");
                    console.log("created webhook");
                }else{
                    console.log("webhook already exist");
                }
            }
        });
    }

    private createWebhook = (auth, name) => {
        let requestUUID = randomUUID();

        POST("https://webshop.one.com/api/v2/webhooks", auth, {
            webhookUrl: "https://api.lassehjalpen.se/newOrder",
            eventType: "ORDER",
            eventName: name,
            meta: {
                requestUUID: requestUUID
            }
        }, (response) => {
            if (response.status == HttpStatusCode.Ok) {
                if (response.data.meta.requestUUID == requestUUID) {
                    //console.log(response.data);
                    this.webhooks[this.webhooks.length] = response.data;
                }
            } else {
                console.log("Failed to add webhook", response.data);
            }
        })
    }

    async receive(req: IncomingMessage, res: ServerResponse) {


        console.log(req.url);


        const url = URL.parse(req.url!, true);
        if(req.method == 'GET') {

            if (url.pathname.startsWith("/connect-app")) {
                // handle connection

                let token: string = url.query.instantToken as string;
                let hostname: string = url.query.hostname as string;
                let shopAdminLocale: string = url.query.shopAdminLocale as string;

                let auth;

                await POST("https://webshop.one.com/api/v2/auth/token/new", token, {
                    clientId: this.clientID,
                    clientSecret: this.clientSecret
                }, (response) => {
                    if (response.status != 200) {
                        res.statusCode = response.status;
                        res.setHeader("Content-Type", "text/plain");
                        res.end(response.data.toString() + "\nInvalid request, please retry or contact support")
                        return;
                    }
                    auth = response.data;
                    return;
                });

                if (!auth) {
                    res.statusCode = HttpStatusCode.InternalServerError;
                    res.setHeader("Content-Type", "text/plain");
                    res.end("Invalid token, Please retry or contact support");
                    return;
                }

                let validToken = false;

                await POST("https://webshop.one.com/api/v2/auth/token/validate", auth, {}, (response) => {
                    if (response.status == HttpStatusCode.Ok) {
                        validToken = true;
                    } else {
                        console.error(response.data);
                    }
                });

                if (!validToken) {
                    res.statusCode = HttpStatusCode.InternalServerError;
                    res.setHeader("Content-Type", "text/plain");
                    res.end("Invalid token, Please retry or contact support");
                    return;
                }

                this.auth = auth;

                fs.writeFile("./config/api.json", JSON.stringify(
                    {
                        clientID: this.clientID,
                        clientSecret: this.clientSecret,
                        auth: this.auth
                    }
                ), () => {
                });

                res.writeHead(HttpStatusCode.Found, {
                    location: "https://" + hostname
                });
                res.end("Redirecting to https://" + hostname);

                // Add webhooks

                this.createWebhook(this.auth, "CREATED");
                this.createWebhook(this.auth, "PAID");

            } else if (url.pathname.startsWith("/unsubscribe")) {
                if (url.query.id) {
                    let id = url.query.id as string;
                    this.newsletterHandler.removeSubscriber(id);
                    res.setHeader("Content-Type", "text/html");
                    res.statusCode = HttpStatusCode.Ok;
                    res.end("You are now unsubscribed from Lasse Hjälpen's newsletter"
                        .replace(/å/g, '&aring;')
                        .replace(/ä/g, '&auml;')
                        .replace(/ö/g, '&ouml;'));
                } else {
                    res.setHeader("Content-Type", "text/plain");
                    res.statusCode = HttpStatusCode.Ok;
                    res.end("The URL is missing an ID. use the link in your email.");
                }
            } else {
                console.log("OneWebShopApplication> " + req.url);
                res.statusCode = HttpStatusCode.BadRequest;
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify({"error": "Invalid request", "message": "The endpoint dosent exist"}));
            }
        }
        else if(req.method == 'POST') {
            if (url.pathname.startsWith("/newOrder")) {
                req.on("data", (chunk) => {
                    let data = JSON.parse(chunk.toString());
                    GET("https://webshop.one.com/api/v2/order/" + data.orderId, this.auth, (response) => {
                        let status = response.data.status;
                        let data: { [key: string]: any } = response.data;
                        switch (response.status) {
                            case HttpStatusCode.Ok: {
                                let id = data.data.number;
                                let orderId = data.data.id;
                                this.adminPanelHandler.newOrder(id, orderId)
                                break;
                            }
                            case HttpStatusCode.NotFound:
                            case HttpStatusCode.BadRequest:
                            case HttpStatusCode.InternalServerError: {
                                console.log("Status " + status + " Message\n" + data.errorDetails);
                                break;
                            }
                        }
                    });
                })
            } else if (url.pathname.startsWith("/paidOrder")) {
                req.on("data", (chunk) => {
                    console.log(chunk.toString());
                })
                console.log(req.url)
            } else if(url.pathname.startsWith("/addsubscriber")){

                let authData = req.headers.authorization;

                if(!authData){
                    res.statusCode = HttpStatusCode.Unauthorized
                    res.setHeader("Content-Type", "text/plain");
                    res.end("Invalid credentials");
                    return;
                }

                const rawAuth = authData.split(' ');
                if(!(rawAuth[0] == "Basic")){
                    res.statusCode = HttpStatusCode.Unauthorized
                    res.setHeader("Content-Type", "text/plain");
                    res.end("Invalid credentials");
                    return;
                }

                const credentials = Buffer.from(rawAuth[1], "base64").toString();

                const [username, password] = credentials.split(':');

                let user = this.config.users[username];

                if(!user){
                    res.statusCode = HttpStatusCode.Unauthorized
                    res.setHeader("Content-Type", "text/plain");
                    res.end("Invalid credentials");
                    return;
                }

                if(!(user == password)){
                    res.statusCode = HttpStatusCode.Unauthorized
                    res.setHeader("Content-Type", "text/plain");
                    res.end("Invalid credentials");
                    return;
                }

                req.on("data", (chunk) => {
                    let email = chunk.toString();
                    if(!email.match(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/)){
                        res.statusCode = HttpStatusCode.Unauthorized
                        res.setHeader("Content-Type", "text/plain");
                        res.end("Invalid credentials");
                        return;
                    }

                    let success = this.newsletterHandler.registerSubscriber(email);

                    if(!success){
                        res.statusCode = HttpStatusCode.Conflict;
                        res.setHeader("Content-Type", "application/json");
                        res.end(JSON.stringify({
                            message: "Already registered"
                        }))
                        return;
                    }

                    res.statusCode = HttpStatusCode.Ok;
                    res.setHeader("Content-Type", "application/json");
                    res.end(JSON.stringify({
                        message: "Successfully registered"
                    }))
                    return;
                });
            }else {
                res.statusCode = HttpStatusCode.BadRequest;
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify({
                    "error": "Endpoint and method doesn't exist"
                }));
                return;
            }
        }else{
            res.statusCode = HttpStatusCode.BadRequest;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({
                "error": "Endpoint and method doesn't exist"
            }));
            return;
        }
    }
}