export class AlreadyLoggedInError extends Error {
    constructor() {
        super("User is already logged in.");
        this.name = "AlreadyLoggedInError";
    }
}
