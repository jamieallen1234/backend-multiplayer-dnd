import { NextFunction, Request, Response } from "express";
import { UnauthorizedRequestError } from "./errors";

function isAuthorizedAdmin(req: Request): boolean {
    return process.env.API_ADMIN_TOKEN === req.get("api-admin-token");
}

function isAuthorizedUser(req: Request): boolean {
    return process.env.API_USER_TOKEN === req.get("api-user-token");
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
