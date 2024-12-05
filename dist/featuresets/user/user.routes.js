"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = __importDefault(require("./user.controller"));
const userRoutes = (0, express_1.Router)();
const userController = new user_controller_1.default();
userRoutes.get("/users", userController.getIndex);
userRoutes.post("/users", userController.createUser);
userRoutes.post("/usersTransaction", userController.createUserTransaction);
userRoutes.get("/users/:id", userController.getUserById);
userRoutes.put("/users/:id", userController.updateUser);
userRoutes.delete("/users/:id", userController.deleteUser);
exports.default = userRoutes;
