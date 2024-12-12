import { NextFunction, Request, Response } from "express";
import { UnauthorizedRequestError } from "./errors";

// Extremely bad practice to hardcode these values. Just setting this way for the test. Never release to production.
const API_ADMIN_TOKEN = process.env.API_ADMIN_TOKEN || "ec97a8517b636537b331c973243e1809369ca1aefc14e561b99bdadf3a54ead3";
const API_USER_TOKEN = process.env.API_USER_TOKEN || "50b10e2b4fb595bd5b4bcc639bf9410fb885b2031985eacfe2da04b787168480";

function isAuthorizedAdmin(req: Request): boolean {
    return API_ADMIN_TOKEN === req.get("api-admin-token");
}

function isAuthorizedUser(req: Request): boolean {
    return API_USER_TOKEN === req.get("api-user-token");
}

export function checkForAdminToken(req: Request, res: Response, next: NextFunction) {
    if (!isAuthorizedAdmin(req)) {
        next(new UnauthorizedRequestError({ message: "Unauthorized request." }));
        return;
    }

    next();
}

export function checkForUserToken(req: Request, res: Response, next: NextFunction) {
    if (!isAuthorizedUser(req)) {
        next(new UnauthorizedRequestError({ message: "Unauthorized request." }));
        return;
    }

    next();
}

export function checkForSharedToken(req: Request, res: Response, next: NextFunction) {
    if (!(isAuthorizedAdmin(req) || isAuthorizedUser(req))) {
        next(new UnauthorizedRequestError({ message: "Unauthorized request." }));
        return;
    }
    next();
}
