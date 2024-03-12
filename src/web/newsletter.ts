import {HttpStatusCode} from './api/HttpStatusCode';

let endpoint: string = "https://api.lassehjalpen.se/addsubscriber"
const auth: string = "018de5af-f66b-7859-82b5-1cd83c42e910"

let newsletterEmailInput = document.getElementById("newsletterInput")
let registerSubscriber = document.getElementById("registerSubscriber");

registerSubscriber.onclick = () => {
    // @ts-ignore
    let email: string = newsletterEmailInput.value;

    if(email.match(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/)){
        fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': "application/text",
                'Authorization': "Basic dXNlcjoyMzdlZjQ3YmFiZTdkMjExZjdmOGI5ZDk3ODFjZWY3Nzg3YjBiZjkwOTk2NzYyMzU5MmUyNzc5NmFmZmI4YjQw"
            },
            body: email
        }).then(async response => {
            if (response.status == HttpStatusCode.Ok || response.status == HttpStatusCode.Conflict) {
                let data = await response.json();
                setValue(data.message)
            } else if (response.status == HttpStatusCode.Unauthorized) {
                setValue("Please contact support");
                throw new Error(`Unauthorized. Contact support. Status: ${response.status}. Body: ${await response.json()}`)
            } else {
                throw new Error(`Invalid HTTP code! Status: ${response.status}`)
            }
        }).catch((error: Error) => {
            console.error("Error during POST request: ", error.message);
        })
    }
}

const setValue = (data: string) => {
    // @ts-ignore
    newsletterEmailInput.value = data;
}