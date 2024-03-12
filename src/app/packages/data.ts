import {Listener} from "./listener";
import {TranssmisionPackage} from "./transsmisionPackage";
import {Product} from "./product";
import {Information} from "./information";
import {Method} from "./method";
import {RawOrderStatus} from "./rawOrderStatus";

export type Data = {
    username?: string,
    password?: string,
    accessToken?: string,
    client?: number,
    page?: string,
    valid?: boolean,
    listener?: Listener,
    order?: number,
    list?: TranssmisionPackage[],
    text?: string,
    name?: string,
    description?: string,
    amount?: number,
    products?: Product[],
    information?: Information,
    method?: Method,
    orderID?: string,
    expirationDate?: number,
    status?: RawOrderStatus,
    lang?: string,
    newsletter?: {
        email: string,
        subject: string
    }
}