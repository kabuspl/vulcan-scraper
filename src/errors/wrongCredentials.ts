export class WrongCredentialsError extends Error {
    constructor() {
        super("Wrong username, password or symbol.");
        this.name = "WrongCredentialsError";
    }
}
