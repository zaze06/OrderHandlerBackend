import * as fs from "fs";
import {GET} from "../webHandler/WebHandler";
import {IncomingMessage, ServerResponse} from "http";
import {sessions} from "../app/sessions";
import {HttpStatusCode} from "axios";
import {RawOrderStatus} from "../app/packages/rawOrderStatus";


type Order = {
    id: number;
    orderId: string;
    status: RawOrderStatus;
    remove?: boolean
}

export enum Status {
    SHIPPED = "SHIPPED",
    NOTSHIPPED = "NOTSHIPPED",
    READYFORPICKUP = "READYFORPICKUP",
    DELIVERED = "DELIVERED"
}

type OrderStatus = {
    status: string;
    data: {
        id: string;
        shopId: string;
        number: number;
        createdTime: string;
        email: string | null;
        transactionId: string | null;
        subTotal: number;
        vat: number;
        currency: string;
        total: number;
        vatIncluded: number;
        key: string | null;
        archived: boolean;
        amountPaid: number;
        vatRate: number | null;
        cancelled: boolean | null;
        amountRefunded: number | null;
        locale: string | null;
        userNotes: string | null;
        unit: string | null;
        modified: string;
        transactionType: string | null;
        cancellationReason: string | null;
        captureStatus: string | null;
        deleted: boolean;
        coupon: string | null;
        discount: number;
        type: string | null;
        draftNumber: number;
        draftCreatetime: string | null;
        reserveStock: boolean | null;
        invoiceId: string | null;
        vatDetails: string | null;
        appVersion: string | null;
        shouldCapturePaymentManually: boolean | null;
        redeemedGiftcards: {
            id: string;
            code: string;
            amount: number;
            voucherType: string;
            vat: number;
            priceIncludeVat: boolean;
        }[];
        timeToCapture: object | null;
        paymentStatus: ("PENDING" | "PAID" | "REFUNDED") | null;
        shippingStatus: Status;
        shippingCost: number;
        refundStatus: ("NONE" | "REFUNDED" | "PARTIAL" | "FULL");
        shippingOption: object | null;
        isPickupShipping: boolean;
        pickupShipping: object;
        hasShippingDetails: boolean;
        billingAddress: {
            firstName: string | null;
            lastName: string | null;
            company: string | null;
            address: string | null;
            zip: number | null;
            city: string | null;
            country: string | null;
            displayCountry: string | null;
            state: string | null;
            displayState: string | null;
            vatNumber: string | null;
            phoneNumber: string | null;
        };
        shippingAddress: {
            firstName: string | null;
            lastName: string | null;
            company: string | null;
            address: string | null;
            zip: number | null;
            city: string | null;
            phoneNumber: string | null;
            details: string | null;
            country: string | null;
            displayCountry: string | null;
            state: string | null;
            displayState: string | null;
        };
        paymentMethod: {
            id: string;
            shopId: string;
            enabled: boolean;
            archived: boolean;
            paymentType: string;
            paymentDetails: {
                enabled_methods: object | null;
                manual_capture: object | null;
                name: string | null;
            };
        };
        vatLegalStatus: {
            id: string;
            shopId: string;
            orderId: string;
            status: ("VALID" | "INVALID" | "NA");
            archived: boolean;
            created: string;
            modified: string;
        };
        orderItems: {
            productId: string | null;
            productName: string;
            productPrice: number;
            productImage: {
                id: string;
                url: string;
                alt: string;
            };
            variantId: string | null;
            orderNumber: number | null;
            optionValues: string[] | null;
            quantity: number;
            sku: string | null;
            quantityRestocked: number;
            weight: number;
            id: string;
            shopId: string;
            orderId: string;
            created: string;
            index: number | null;
            type: string;
        }[];
        orderEvents: {
            id: string;
            orderNumber: number | null;
            eventName: string;
            eventDetails: object | null;
            archived: boolean;
            time: string;
            shopId: string;
            orderId: string;
        }[];
        orderTransactions: {
            id: string;
            amount: number;
            orderNumber: number | null;
            shopId: string;
            orderId: string;
        }[];
        isPureDigital: boolean | null;
        hasCustomEvents: boolean | null;
        redeemedGiftCardsTotal: number;
        isAwaitedForPaymentNotification: boolean | null;
        paidTime: string | null;
        channelId: string;
    };
};

type ApiConfig = {
    clientID: string,
    clientSecret: string,
    auth: string
}

export class AdminPanelHandler {
    private orders: Order[] = JSON.parse(fs.readFileSync("./data/orders.json").toString());

    private recentOrderRequests: {[key: number]: OrderStatus} = {};

    private config: ApiConfig = JSON.parse(fs.readFileSync("./config/api.json").toString())

    private readonly clientID = this.config.clientID;
    private readonly clientSecret = this.config.clientSecret;

    private auth: string = this.config.auth;
    private updateInterval: NodeJS.Timeout;

    constructor() {
        this.updateInterval = setInterval(() => {
            let tmp: Order[] = JSON.parse(fs.readFileSync("./data/orders.json").toString());

            const combinedSubscribers = [...this.orders, ...tmp];
            // Deduplicate based on unique identifier (e.g., id)
            this.orders = Array.from(new Set(combinedSubscribers.map(subscriber => subscriber.id)))
                .map(id => combinedSubscribers.find(subscriber => subscriber.id === id));

            this.orders = this.orders.filter(sub => !sub.remove);

            fs.writeFile("./data/orders.json", JSON.stringify(this.orders), () => {});
        }, 5 * 60 * 1000);
    }

    newOrder = (id: number, orderId: string) => {
        this.orders.push({
            orderId: orderId,
            id: id,
            status: RawOrderStatus.RECEIVED
        })
    }

    nextStatus = (id?: number, orderID?: string): void => {
        if (!(id || orderID)) {
            console.error("Invalid parameters. Please provide either 'id' or 'orderID'.");
            return;
        }

        const orderToUpdate = this.orders.find(order => order.id === id || order.orderId === orderID);

        if (!orderToUpdate) {
            console.error("Order not found.");
            return;
        }

        orderToUpdate.status = RawOrderStatus.advance(orderToUpdate.status);
    };

    previousStatus = (id?: number, orderID?: string) => {
        if(!(id && orderID)) return null;

        let order1 = this.orders.find(order => order.id == id || order.orderId == orderID);
        order1.status = RawOrderStatus.advance(order1.status);
    }

    rawStatus = (id?: number, orderID?: string): RawOrderStatus => {
        if(!(id || orderID)) return RawOrderStatus.UNKNOWN;

        let order1 = this.orders.find(order => order.id == id || order.orderId == orderID);

        if(!order1) return RawOrderStatus.UNKNOWN

        return order1.status;
    }

    getOrderStatus = async (id?: number, orderId?: string): Promise<Status | null> => {
        if(!(id && orderId)) return null;

        if(this.recentOrderRequests[id]){
            return this.recentOrderRequests[id].data.shippingStatus;
        }

        if(!orderId){
            let order = this.orders.filter((order: Order) => order.id == id);
            if(!(order && order.length > 0)) return null;
            orderId = order[0].orderId;
        }

        await GET("https://webshop.one.com/api/v2/order/"+orderId, this.auth, (response) => {
            let status = response.data.status;
            let data: {[key: string]: any} = response.data;
            switch (response.status){
                case HttpStatusCode.Ok: {
                    let id = data.data.number;

                    // @ts-ignore
                    this.recentOrderRequests[id] = data;

                    return data.data.shippingStatus;
                }
                case HttpStatusCode.NotFound:
                case HttpStatusCode.BadRequest:
                case HttpStatusCode.InternalServerError: {
                    console.log("Status "+status+" Message\n"+data.errorDetails);
                    return null;
                }
            }
        });
    }

    async getAllOrder(): Promise<OrderStatus[]> {
        let orders: OrderStatus[] = [];

        for(let raw of this.orders){
            let order = this.recentOrderRequests[raw.id];

            if(order){
                orders[orders.length] = order;
            }else{
                await GET("https://webshop.one.com/api/v2/order/"+raw.orderId, this.auth, (response) => {
                    let status = response.data.status;
                    let data: {[key: string]: any} = response.data;
                    switch (response.status){
                        case HttpStatusCode.Ok: {
                            let id = data.data.number;

                            // @ts-ignore
                            this.recentOrderRequests[id] = data;

                            orders[orders.length] = data as OrderStatus;
                        }
                        case HttpStatusCode.NotFound:
                        case HttpStatusCode.BadRequest:
                        case HttpStatusCode.InternalServerError: {
                            console.log("Status "+status+" Message\n"+data.errorDetails);
                        }
                    }
                });
            }
        }

        return orders;
    }

    async getOrder(id: number): Promise<OrderStatus> {

        let order = this.recentOrderRequests[id];

        if(order){
            return order;
        }else{
            let raw = this.orders.find(order1 => order1.id == id);
            await GET("https://webshop.one.com/api/v2/order/"+raw.orderId, this.auth, (response) => {
                let status = response.data.status;
                let data: {[key: string]: any} = response.data;
                switch (response.status){
                    case HttpStatusCode.Ok: {
                        let id = data.data.number;

                        // @ts-ignore
                        this.recentOrderRequests[id] = data;

                        return data as OrderStatus;
                    }
                    case HttpStatusCode.NotFound:
                    case HttpStatusCode.BadRequest:
                    case HttpStatusCode.InternalServerError: {
                        console.log("Status "+status+" Message\n"+data.errorDetails);
                    }
                }
            });
        }
    }

    private parseCookies(cookieHeader: string | undefined): Record<string, string> {
        const cookies: Record<string, string> = {};
        if (cookieHeader) {
            cookieHeader.split(';').forEach(cookie => {
                const [key, value] = cookie.split('=').map(part => part.trim());
                cookies[key] = value;
            });
        }
        return cookies;
    }

    receive(req: IncomingMessage, res: ServerResponse) {
        if(req.method == 'GET') {
            let cookies = this.parseCookies(req.headers.cookie);

            if (!sessions.validateSession(cookies["accessToken"])) {
                res.writeHead(302, {'Location': 'https://lassehjalpen.se/se/ordrar'});
                res.end();
                return;
            }

            if (req.url == "/") {
                let username = sessions.getUsername(cookies["accessToken"]);
                if (username) {
                    fs.readFile("./web/adminLunchPage.html", (err, data) => {
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
                }
            } else if (req.url == "/adminLunchPage.js") {
                fs.readFile("./web/adminLunchPage.js", (err, data) => {
                    if (err) {
                        res.statusCode = 404;
                        res.end();
                        return;
                    }

                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/javascript");
                    res.end(data);
                })
            } else if (req.url == "/newsletter") {
                let username = sessions.getUsername(cookies["accessToken"]);
                if (username) {
                    fs.readFile("./web/newsletterPage.html", (err, data) => {
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
                }
            } else if (req.url == "/newsletterPage.js") {
                let username = sessions.getUsername(cookies["accessToken"]);
                if (username) {
                    fs.readFile("./web/newsletterPage.js", (err, data) => {
                        if (err) {
                            res.statusCode = 404;
                            res.end();
                            return;
                        }

                        res.statusCode = 200;
                        res.setHeader("Content-Type", "application/javascript");
                        res.end(data);
                    })
                }
            } else if (req.url == "/orderList") {
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
                }
            } else if (req.url == "/orderList.js") {
                let username = sessions.getUsername(cookies["accessToken"]);
                if (username) {
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
                }
            }
        }else{
            res.statusCode = HttpStatusCode.NotFound;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({
                "error": "Not Found"
            }));
            return;
        }
    }

    PDFHtml = `
<html>
  <head>
    <meta charset="utf-8" />
    <title>Hello world!</title>
  </head>
  <body>
    <h1>User List</h1>
    <ul>
      {{#each users}}
      <li>Name: {{this.name}}</li>
      <li>Age: {{this.age}}</li>
      <br />
      {{/each}}
    </ul>
  </body>
</html>
    `

    async createPDF(id: number, callback: (pdf: Buffer) => void): Promise<void>{
        let order = await this.getOrder(id)
        if(fs.existsSync("./orders/"+order+"-content.pdf")){
            fs.readFile("./orders/"+order+"-content.pdf", (err, data) => {
                if(err){
                    console.error(err);
                }else{
                    callback(data);
                }
            })
        }else {
            /*(async () => {
                const pdf = await PdfDocument.fromHtml(this.PDFHtml);

                await pdf.saveAs("./orders/"+order+"-content.pdf");

                fs.readFile("./orders/"+order+"-content.pdf", (err, data) => {
                    if(err){
                        console.error(err);
                    }else{
                        callback(data);
                    }
                })
            })();*/
        }
    }

}