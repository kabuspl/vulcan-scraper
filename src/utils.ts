import { fetchCookie } from "./vulcanHandler.js";

/**
 * Post json data to url.
 * @param url - Url to fetch.
 * @param json - Object to convert to json and post.
 * @returns Same promise that fetch would normally return.
 */
export function postJSON(url: string, json: object) {
    return fetchCookie(url, {
        method: "POST",
        headers: {
            "content-type": "application/json"
        },
        body: JSON.stringify(json)
    });
}

/**
 * Convert date to date of previous monday
 * @param d Any date
 * @returns Date of previous monday relative to `d`
 */
export function getMonday(d: Date) {
    d = new Date(d);
    const day = d.getDay();
    const diff = d.getDate() - day + (day == 0 ? -6 : 1); // adjust when day is sunday
    return new Date(d.setDate(diff));
}
