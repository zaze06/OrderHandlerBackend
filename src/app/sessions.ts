import {randomUUID} from "crypto";
import * as fs from "fs";

interface AccessToken {
    id: string;
    expirationTime: number; // Timestamp when the session will expire
    user: string;
}

export class sessions {

    private static users: {[key: string]: string} = JSON.parse(fs.readFileSync("./config/users.json", "utf8"))

    private static validSessions: AccessToken[] = [];
    public static createNewSession = (username: string, password: string): AccessToken | null => {
        if(!(sessions.users[username] == password)) return null
        const sessionID = randomUUID();
        const expirationTime = Date.now() + 14400000;// 4hours in milliseconds
        const session: AccessToken = {id: sessionID, expirationTime, user: username};
        //console.log("Before adding: "+sessions.validSessions.length)
        sessions.validSessions[sessions.validSessions.length] = session;
        //console.log("After adding: "+sessions.validSessions.length)
        return session;
    }

    /**
     * Validates the session, returns true if the session hasn't expired, else false
     * @param accessTokenID Access token for a session
     */
    public static validateSession = (accessTokenID: string): boolean => {
        if(!accessTokenID) return false;
        const session = sessions.validSessions.find((session) => session.id === accessTokenID);
        if(!session) return false;
        //console.log(JSON.stringify(session)+" "+accessTokenID+" "+Date.now())
        if(session.expirationTime > Date.now()){
            return true;
        }
        sessions.validSessions = sessions.validSessions.filter(session => session.id !== accessTokenID);
        return false;
    }

    /**
     * Remove session if it has expired and returns the username
     * @param accessTokenID Access token for a session
     */
    public static getUsername = (accessTokenID: string): string => {
        console.log(accessTokenID);
        console.log(sessions.validSessions)
        if(!accessTokenID) return "";
        const session = sessions.validSessions.find((session) => session.id === accessTokenID);
        if(!session) return "";
        //console.log(JSON.stringify(session)+" "+accessTokenID)
        if(session.expirationTime > Date.now()){
            return session.user
        }
        sessions.validSessions = sessions.validSessions.filter(session => session.id !== accessTokenID);
        return "";
    }

    public static removeSession = (accessTokenID: string) => {
        sessions.validSessions = sessions.validSessions.filter(session => session.id !== accessTokenID);
    }


}