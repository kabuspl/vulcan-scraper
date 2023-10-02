import makeFetchCookie from 'fetch-cookie';
import { parse } from 'node-html-parser';
import { AlreadyLoggedInError, NotLoggedInError, WrongCredentialsError } from './errors.js';

const cookieJar = new makeFetchCookie.toughCookie.CookieJar();
// const fetch = wrapFetch({ cookieJar });
const fetchCookie = makeFetchCookie(fetch, cookieJar)

/**
 * Post json data to url.
 * @param {string} url - Url to fetch.
 * @param {object} json - Object to convert to json and post.
 * @returns Same promise that fetch would normally return.
 */
function postJSON(url, json) {
    return fetchCookie(url, {
        method: "POST",
        headers: {
            "content-type": "application/json"
        },
        body: JSON.stringify(json)
    });
}

export class VulcanHandler {
    #symbol;
    #schoolSymbol;
    #register;
    #username;
    #password;
    #loggedIn = false;

    /**
     * Creates VulcanHandler. After creating call .login() before doing anything else.
     * @param {string} username - Username used to login to uonet.
     * @param {string} password - Password used to login to uonet.
     * @param {string} symbol - Symbol from login page url.
     */
    constructor(username, password, symbol) {
        this.#username = username;
        this.#password = password;
        this.#symbol = symbol;
    }

    /**
     * Log in to vulcan
     */
    async login() {
        if(this.#loggedIn) throw new AlreadyLoggedInError();

        const baseLoginUrl = "https://cufs.vulcan.net.pl/{symbol}/Account/LogOn?ReturnUrl=%2F{symbol}%2FFS%2FLS%3Fwa%3Dwsignin1.0%26wtrealm%3Dhttps%253A%252F%252Feduone.pl%252F{symbol}%252FLoginEndpoint.aspx%26wctx%3Dhttps%253A%252F%252Feduone.pl%252F{symbol}%252FLoginEndpoint.aspx";
        // Replace {symbol} with user provided symbol
        const currentLoginUrl = baseLoginUrl.replaceAll("{symbol}", this.#symbol);

        // Start logging in
        const request = await fetchCookie(currentLoginUrl, {
            method: "POST",
            body: new URLSearchParams({
                LoginName: this.#username,
                Password: this.#password
            })
        });

        // Parse html from response
        const parsedDom = parse(await request.text());

        // If document title is not "Working..." credentials are wrong
        if(parsedDom.querySelector("title").textContent != "Working...") throw new WrongCredentialsError();

        // Extract values from html form fields
        const wa = parsedDom.querySelector("[name='wa']").getAttribute("value");
        const wresult = parsedDom.querySelector("[name='wresult']").getAttribute("value");
        const wctx = parsedDom.querySelector("[name='wctx']").getAttribute("value");

        // Finish logging in
        const finalRequest = await fetchCookie("https://uonetplus.vulcan.net.pl/"+this.#symbol+"/LoginEndpoint.aspx", {
            method: "POST",
            body: new URLSearchParams({
                wa,
                wresult,
                wctx
            })
        });

        // Parse html from response
        const finalParsedDom = parse(await finalRequest.text());

        //Extract school symbol from html
        const schoolSymbol = finalParsedDom.querySelector("a[title='Uczeń']").getAttribute("href").split("/")[4];
        this.#schoolSymbol = schoolSymbol;

        // Get register list
        const registerList = await (await postJSON("https://uonetplus-uczen.vulcan.net.pl/"+this.#symbol+"/"+this.#schoolSymbol+"/UczenDziennik.mvc/Get", {})).json();

        // 0 is always newest register
        const currentRegister = registerList.data[0];

        // Set cookies needed by other endpoints
        cookieJar.setCookie(new makeFetchCookie.toughCookie.Cookie({
            domain: "uonetplus-uczen.vulcan.net.pl",
            key: "idBiezacyDziennikPrzedszkole",
            value: currentRegister.IdPrzedszkoleDziennik
        }), "https://uonetplus-uczen.vulcan.net.pl")
        cookieJar.setCookie(new makeFetchCookie.toughCookie.Cookie({
            domain: "uonetplus-uczen.vulcan.net.pl",
            key: "idBiezacyDziennikWychowankowie",
            value: currentRegister.IdWychowankowieDziennik
        }), "https://uonetplus-uczen.vulcan.net.pl")
        cookieJar.setCookie(new makeFetchCookie.toughCookie.Cookie({
            domain: "uonetplus-uczen.vulcan.net.pl",
            key: "idBiezacyDziennik",
            value: currentRegister.IdDziennik
        }), "https://uonetplus-uczen.vulcan.net.pl")
        cookieJar.setCookie(new makeFetchCookie.toughCookie.Cookie({
            domain: "uonetplus-uczen.vulcan.net.pl",
            key: "idBiezacyUczen",
            value: currentRegister.IdUczen,
        }), "https://uonetplus-uczen.vulcan.net.pl");

        this.#register = currentRegister;
        this.#loggedIn = true;
    }

    async logout() {
        if(!this.#loggedIn) throw new NotLoggedInError();

        await cookieJar.removeAllCookies();
        this.#loggedIn = false;
    }

    /**
     * Gets current period from register.
     * @returns {object} Period object.
     */
    getCurrentPeriod() {
        if(!this.#loggedIn) throw new NotLoggedInError();

        // Iterate through every period in register and check which includes today's date. Then return it.
        for(const period of this.#register.Okresy) {
            const from = new Date(period.DataOd).getTime();
            const to = new Date(period.DataDo).getTime();
            const now = new Date().getTime();
            const isNowIncluded = from <= now && to >= now;
            if(isNowIncluded) return period;
        }
    }

    async getStudentGrades() {
        if(!this.#loggedIn) throw new NotLoggedInError();

        // Get data from vulcan
        const resp = await (await postJSON("https://uonetplus-uczen.vulcan.net.pl/"+this.#symbol+"/"+this.#schoolSymbol+"/Oceny.mvc/Get", { okres: this.getCurrentPeriod(this.#register).Id })).json();

        const returnBuilder = {}
        // Iterate through every subject and convert it to better data format
        for(const subject of resp.data.Oceny) {
            const grades = subject.OcenyCzastkowe;
            returnBuilder[subject.Przedmiot] = {
                average: subject.Srednia,
                grades: []
            }
            for(const grade of grades) {
                // Convert dd.mm.yyyy to js Date()
                const dateSplit = grade.DataOceny.split(".");
                const date = new Date();
                date.setFullYear(dateSplit[2]);
                date.setMonth(dateSplit[1]-1);
                date.setDate(dateSplit[0]);

                // Push grade to array
                returnBuilder[subject.Przedmiot].grades.push({
                    teacher: grade.Nauczyciel,
                    grade: grade.Wpis,
                    weight: grade.Waga,
                    description: grade.NazwaKolumny,
                    code: grade.KodKolumny,
                    date,
                    color: grade.KolorOceny
                })
            }
        }
        return returnBuilder;
    }

    /**
     * Gets class grades for current period (semester)
     * @returns {object} Class grades
     */
    async getClassGrades() {
        if(!this.#loggedIn) throw new NotLoggedInError();

        // Get data from vulcan
        const resp = await (await postJSON("https://uonetplus-uczen.vulcan.net.pl/"+this.#symbol+"/"+this.#schoolSymbol+"/Statystyki.mvc/GetOcenyCzastkowe", { idOkres: this.getCurrentPeriod(this.#register).Id })).json();

        const returnBuilder = {}
        // Iterate through every subject and convert it to better data format
        for(const subject of resp.data) {
            const classSeries = subject.ClassSeries;
            if(classSeries.IsEmpty) {
                // If no grades were returned set them to 0
                returnBuilder[subject.Subject] = {
                    grades: {
                        1: 0,
                        2: 0,
                        3: 0,
                        4: 0,
                        5: 0,
                        6: 0
                    },
                    average: 0
                }
            } else {
                returnBuilder[subject.Subject] = {
                    grades: {
                        1: classSeries.Items[5].Value,
                        2: classSeries.Items[4].Value,
                        3: classSeries.Items[3].Value,
                        4: classSeries.Items[2].Value,
                        5: classSeries.Items[1].Value,
                        6: classSeries.Items[0].Value
                    },
                    average: parseFloat(classSeries.Average) // For some reason average is returned as string so we need to convert it
                }
            }
        }
        return returnBuilder;
    }
}
