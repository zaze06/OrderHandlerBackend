import * as fs from "fs";
import * as nodemailer from "nodemailer"
import {randomUUID} from "crypto";


export class NewsletterHandler {
    private config = JSON.parse(fs.readFileSync("./config/mail.json").toString());
    private newsletterSubscribers: {id: string, email: string, remove?:boolean}[] = JSON.parse(fs.readFileSync("./data/newsletter.json").toString());
    private updateInterval: NodeJS.Timeout;

    constructor() {
        this.updateInterval = setInterval(() => {
            let tmp: {id: string, email: string}[] = JSON.parse(fs.readFileSync("./data/newsletter.json").toString());

            const combinedSubscribers = [...this.newsletterSubscribers, ...tmp];
            // Deduplicate based on unique identifier (e.g., id)
            this.newsletterSubscribers = Array.from(new Set(combinedSubscribers.map(subscriber => subscriber.id)))
                .map(id => combinedSubscribers.find(subscriber => subscriber.id === id));

            this.newsletterSubscribers = this.newsletterSubscribers.filter(sub => !sub.remove);

            fs.writeFile("./data/newsletter.json", JSON.stringify(this.newsletterSubscribers), () => {});
        }, 5 * 60 * 1000);
    }

    private transporter = nodemailer.createTransport({
        host: "send.one.com",
        port: 465,
        secure: true,
        auth: {
            user: this.config.email,
            pass: this.config.password
        }
    });

    sendMail (message: string, subject: string){
        message = message
            .replace(/å/g, '&aring;')
            .replace(/ä/g, '&auml;')
            .replace(/ö/g, '&ouml;');

        subject = subject
            .replace(/å/g, '&aring;')
            .replace(/ä/g, '&auml;')
            .replace(/ö/g, '&ouml;');

        this.newsletterSubscribers.forEach((subscriber) => {
            this.transporter.sendMail({
                from: "Lasse <"+this.config.email+">",
                to: subscriber.email,
                subject: subject,
                html: "<h1>Lasse Hjälpen</h1><br><br><div>"+message+"</div><br><br><br><a href='https://api.lassehjalpen.se/unsubscribe?id="+subscriber.id+"' title='unsubscribe' >Unsubscribe</a>"
            }, (err, info) => {
                if(err){
                    console.error(err);
                }else{

                }
            })
        })
    }

    removeSubscriber(id: string){
        let subscriber = this.newsletterSubscribers.filter(subscriber => subscriber.id == id);
        if(!(subscriber.length > 0)) return;

        this.newsletterSubscribers.forEach(sub => {
            if(sub.id == id){
                sub.remove = true;
            }
        })

        this.transporter.sendMail({
            from: "Lasse <"+this.config.email+">",
            to: subscriber[0].email,
            subject: "Successfully unsubscribed",
            html: "<p>You have successfully unsubscribed from Lasse Hjälpen's newsletter. If this was intentional, we appreciate your time with us. If you ever wish to receive updates again, feel free to visit our website at your convenience.</p>"
                .replace(/å/g, '&aring;')
                .replace(/ä/g, '&auml;')
                .replace(/ö/g, '&ouml;')
        }, (err, info) => {
            if (err) {
                console.error(err);
            } else {

            }
        });
    }

    registerSubscriber = (email: string) => {

        if(this.newsletterSubscribers.find(sub => sub.email == email)){
            return false;
        }

        let id = randomUUID()

        this.newsletterSubscribers[this.newsletterSubscribers.length] = {
            email: email,
            id: id
        }

        this.transporter.sendMail({
            from: "Lasse <"+this.config.email+">",
            to: email,
            subject: "Welcome!",
            html: "<p>You are now subscribed to Lasse Hjälpen's newsletter. If this weren't intentional you can </p><a href='https://api.lassehjalpen.se/unsubscribe?id="+id+"' title='unsubscribe'>Unsubscribe</a>"
                .replace(/å/g, '&aring;')
                .replace(/ä/g, '&auml;')
                .replace(/ö/g, '&ouml;')
        }, (err, info) => {
            if (err) {
                console.error(err);
            } else {

            }
        });

        return true;
    }
}