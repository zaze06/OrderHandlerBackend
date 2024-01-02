export class Cookies {
    public static get = (cookieName: string): Cookie => {
        for(let cookie of Cookies.parseCookies(document.cookie)){
            if(cookie.name === cookieName){
                return cookie;
            }
        }
        return undefined
    };

    public static set = (cookie: Cookie) => {
        document.cookie = Cookies.serializeCookie(cookie)
    }

    public static remove = (cookieName: string) => {
        let cookie = Cookies.get(cookieName);
        if(cookie) {
            cookie.expires = 0;
            document.cookie = Cookies.serializeCookie(cookie);
        }
    }

    public static parseCookies(cookieString: string): Cookie[] {
        const cookies: Cookie[] = [];

        if (cookieString) {
            const cookiePairs = cookieString.split(';');

            for (const pair of cookiePairs) {
                const [name, value] = pair.trim().split('=');
                const cookie: Cookie = { name: name, value: value };

                cookies.push(cookie);
            }
        }

        return cookies;
    }

    public static serializeCookie(cookie: Cookie): string {
        let cookieString = `${cookie.name}=${cookie.value}`;

        if (cookie.expires) {
            const expiresDate = new Date(cookie.expires);
            cookieString += `; Expires=${expiresDate.toUTCString()}`;
        }

        if (cookie.domain) {
            cookieString += `; Domain=${cookie.domain}`;
        }

        if (cookie.path) {
            cookieString += `; Path=${cookie.path}`;
        }

        if (cookie.secure) {
            cookieString += `; Secure`;
        }

        if (cookie.httpOnly) {
            cookieString += `; HttpOnly`;
        }

        if (cookie.sameSite) {
            cookieString += `; SameSite=${cookie.sameSite}`;
        }

        return cookieString;
    }
}

export type Cookie = {
    name: string;
    value: string;
    expires?: number;
    domain?: string;
    path?: string;
    secure?: boolean;
    httpOnly?: boolean;
    sameSite?: 'Strict' | 'Lax' | 'None';
};