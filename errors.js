export class NotLoggedInError extends Error {
    constructor() {
        super("User is not logged in.");
        this.name = "NotLoggedInError";
    }
}

export class AlreadyLoggedInError extends Error {
    constructor() {
        super("User is already logged in.");
        this.name = "AlreadyLoggedInError";
    }
}

export class WrongCredentialsError extends Error {
    constructor() {
        super("Wrong username, password or symbol.");
        this.name = "WrongCredentialsError";
    }
}