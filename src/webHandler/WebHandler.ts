import axios, {AxiosResponse} from "axios";

export const POST = async (url: string, token: string, requestBody: {[key: string]: any}, callback: (response: AxiosResponse<any, any>) => any) => {
    try{
        const response = await axios.post(url, requestBody, {
            headers: {
                Authorization: "Bearer "+token,
                'Content-Type': 'application/json'
            }
        });

        callback(response);
    }catch (e) {
        console.error(e);
        console.error(e.response.data);
        return undefined
    }
}

export const GET = async (url: string, token: string, callback: (response: AxiosResponse<any, any>) => any) => {
    try{
        const response = await axios.get(url, {
            headers: {
                Authorization: "Bearer "+token
            }
        })

        callback(response);
    }catch (e){
        console.log(e);
    }
}