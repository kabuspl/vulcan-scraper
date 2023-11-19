import makeFetchCookie from 'fetch-cookie';
import { parse } from 'node-html-parser';
import { AlreadyLoggedInError, NotLoggedInError, WrongCredentialsError } from './errors.js';
import { StudentGuardian, StudentInfo, StudentInfoRepsonse } from './student.js';
import { URLSearchParams } from "url";
import { PeriodResponse, RegisterResponse } from './register.js';
import { VulcanResponse } from './response.js';
import { Grades, GradesResponse } from './grades.js';
import { ClassGrades, SubjectClassGrades, SubjectClassGradesResponse } from './classGrades.js';

const cookieJar = new makeFetchCookie.toughCookie.CookieJar();
const fetchCookie = makeFetchCookie(fetch, cookieJar)

/**
 * Post json data to url.
 * @param url - Url to fetch.
 * @param json - Object to convert to json and post.
 * @returns Same promise that fetch would normally return.
 */
function postJSON(url: string, json: object) {
    return fetchCookie(url, {
        method: "POST",
        headers: {
            "content-type": "application/json"
        },
        body: JSON.stringify(json)
    });
}

export interface LoginOptions {
    /**
     * Automatically refresh session to prevent logout.
     *
     * If set to `true` interval is created that runs VulcanHandler.refreshSession() every 900s (15min), this interval may prevent your app from closing. It is cleared when you call .logout().
     *
     * If `false` you need to manually call VulcanHandler.refreshSession() every ~15 minutes but your app will not be prevented from closing.
     */
    autoRefresh: boolean
}

export class VulcanHandler {
    #symbol;
    #schoolSymbol;
    #register: RegisterResponse;
    #username;
    #password;
    #loggedIn = false;
    #refreshSessionInterval;

    /**
     * Creates VulcanHandler. After creating call .login() before doing anything else.
     * @param username - Username used to login to uonet.
     * @param password - Password used to login to uonet.
     * @param symbol - Symbol from login page url.
     */
    constructor(username: string, password: string, symbol: string) {
        this.#username = username;
        this.#password = password;
        this.#symbol = symbol;
    }

    /**
     * Log in to vulcan
     */
    async login(options: LoginOptions = { autoRefresh: true }) {
        if(this.#loggedIn) throw new AlreadyLoggedInError();

        // Request login page and get url from redirection
        const baseLoginPageUrl: string = "https://uonetplus.vulcan.net.pl/{symbol}/LoginEndpoint.aspx";
        const loginPageRequest = await fetchCookie(baseLoginPageUrl.replaceAll("{symbol}", this.#symbol));
        // Just wait for request completion. Idk if there is any better way
        await loginPageRequest.status;

        const loginEndpointUrl = loginPageRequest.url;

        // Start logging in
        const loginStep1Request = await fetchCookie(loginEndpointUrl, {
            method: "POST",
            body: new URLSearchParams({
                LoginName: this.#username,
                Password: this.#password
            })
        });

        // Parse html from response
        const loginStep1ParsedDom = parse(await loginStep1Request.text());

        // If document title is not "Working..." credentials are wrong
        if(loginStep1ParsedDom.querySelector("title").textContent != "Working...") throw new WrongCredentialsError();

        // Extract values from html form fields
        const wa = loginStep1ParsedDom.querySelector("[name='wa']").getAttribute("value");
        let wresult = loginStep1ParsedDom.querySelector("[name='wresult']").getAttribute("value");
        const wctx = loginStep1ParsedDom.querySelector("[name='wctx']").getAttribute("value");

        // POST extracted values to form action url
        const loginStep2Request = await fetchCookie(loginStep1ParsedDom.querySelector("form").getAttribute("action"), {
            method: "POST",
            body: new URLSearchParams({
                wa,
                wresult,
                wctx
            })
        });

        // Parse html from response
        const loginStep2ParsedDom = parse(await loginStep2Request.text());

        // Get new wresult value. Other values are the same
        wresult = loginStep2ParsedDom.querySelector("[name='wresult']").getAttribute("value");

        // POST extracted values to form action url once again
        const loginFinalStepRequest = await fetchCookie(loginStep2ParsedDom.querySelector("form").getAttribute("action"), {
            method: "POST",
            body: new URLSearchParams({
                wa,
                wresult,
                wctx
            })
        });

        // Parse html from response
        const loginFinalStepParsedDom = parse(await loginFinalStepRequest.text());

        //Extract school symbol from html
        const schoolSymbol = loginFinalStepParsedDom.querySelector("a[title='Uczeń']").getAttribute("href").split("/")[4];
        this.#schoolSymbol = schoolSymbol;

        // Get register list
        const registerList = await (await postJSON("https://uonetplus-uczen.vulcan.net.pl/"+this.#symbol+"/"+this.#schoolSymbol+"/UczenDziennik.mvc/Get", {})).json() as VulcanResponse<RegisterResponse>;

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

        // Refresh session every 900 sec (15 min)
        if(options.autoRefresh) this.#refreshSessionInterval = setInterval(()=>{this.refreshSession()}, 900);
    }

    /**
     * Log out from Vulcan
     */
    async logout() {
        if(!this.#loggedIn) throw new NotLoggedInError();

        if(this.#refreshSessionInterval) clearInterval(this.#refreshSessionInterval);
        await cookieJar.removeAllCookies();
        this.#loggedIn = false;
    }

    /**
     * Refreshes Vulcan session to prevent automatic logout.
     */
    async refreshSession() {
        if(!this.#loggedIn) throw new NotLoggedInError();

        await fetchCookie("https://uonetplus-uczen.vulcan.net.pl/"+this.#symbol+"/"+this.#schoolSymbol+"/Home.mvc/RefreshSession?_dc="+Math.floor(new Date().getTime()/1000));
    }

    /**
     * Gets current period from register.
     * @returns Period object.
     */
    getCurrentPeriod(): PeriodResponse {
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

    /**
     * Get student grades for current period (semester)
     * @returns Student grades
     */
    async getStudentGrades() {
        if(!this.#loggedIn) throw new NotLoggedInError();

        // Get data from vulcan
        const resp = await (await postJSON("https://uonetplus-uczen.vulcan.net.pl/"+this.#symbol+"/"+this.#schoolSymbol+"/Oceny.mvc/Get", { okres: this.getCurrentPeriod().Id })).json() as VulcanResponse<GradesResponse>;

        const returnBuilder: Grades = {}
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
                date.setFullYear(parseInt(dateSplit[2]));
                date.setMonth(parseInt(dateSplit[1])-1);
                date.setDate(parseInt(dateSplit[0]));

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
     * @returns Class grades
     */
    async getClassGrades() {
        if(!this.#loggedIn) throw new NotLoggedInError();

        // Get data from vulcan
        const resp = await (await postJSON("https://uonetplus-uczen.vulcan.net.pl/"+this.#symbol+"/"+this.#schoolSymbol+"/Statystyki.mvc/GetOcenyCzastkowe", { idOkres: this.getCurrentPeriod().Id })).json() as VulcanResponse<SubjectClassGradesResponse[]>;

        const returnBuilder: ClassGrades = {}
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

    /**
     * Get student information from register
     * @returns Information about current student and his parents/guardians
     */
    async getStudentInfo() {
        if(!this.#loggedIn) throw new NotLoggedInError();

        // Get data from vulcan
        const resp = await (await postJSON("https://uonetplus-uczen.vulcan.net.pl/"+this.#symbol+"/"+this.#schoolSymbol+"/Uczen.mvc/Get", {})).json() as VulcanResponse<StudentInfoRepsonse>;

        const studentInfo: StudentInfo = {
            name: resp.data.Imie,
            middleName: resp.data.Imie2,
            lastName: resp.data.Nazwisko,
            familyName: resp.data.NazwiskoRodowe,
            fullName: resp.data.ImieNazwisko,
            birthDate: new Date(resp.data.DataUrodzenia.replace(" ", "T")+"Z"),
            birthPlace: resp.data.MiejsceUrodzenia,
            hasPolishCitizenship: Boolean(resp.data.ObywatelstwoPolskie),
            gender: resp.data.Plec ? "male" : "female",
            address: resp.data.AdresZamieszkania,
            registeredAddress: resp.data.AdresZameldowania,
            correspondenceAddress: resp.data.AdresKorespondencji,
            homePhone: resp.data.TelDomowy,
            phone: resp.data.TelKomorkowy,
            email: resp.data.Email,
            isPeselVisible: resp.data.CzyWidocznyPesel,
            isAddressVisible: !resp.data.UkryteDaneAdresowe,
            isPhotoVisivle: resp.data.ShowPhoto,
            hasPesel: resp.data.PosiadaPesel,
            isPole: resp.data.Polak,
            guardians: []
        }

        for(let i = 1; i <=2; i++) {
            const guardianData = resp.data["Opiekun"+i];
            const guardian: StudentGuardian = {
                id: guardianData.Id,
                name: guardianData.Imie,
                lastName: guardianData.Nazwisko,
                kinship: guardianData.StPokrewienstwa,
                address: guardianData.Adres == "Taki sam jak ucznia" ? studentInfo.address : guardianData.Adres,
                homePhone: guardianData.TelDomowy,
                cellPhone: guardianData.TelKomorkowy,
                workPhone: guardianData.TelSluzbowy,
                email: guardianData.Email,
                fullName: guardianData.FullName,
                phone: guardianData.Telefon
            }
            studentInfo.guardians.push(guardian);
        }

        return studentInfo;
    }
}
