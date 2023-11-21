export class NotLoggedInError extends Error {
    constructor() {
        super("User is not logged in.");
        this.name = "NotLoggedInError";
    }
}
