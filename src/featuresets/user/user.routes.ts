import { Router } from "express";
import UserController from "./user.controller";
import UserService from "./user.service";

const userRoutes = Router();
const userService = new UserService();
const userController = new UserController(userService);


/*
userRoutes.get("/users", userController.getIndex);
userRoutes.post("/users", userController.createUser);
userRoutes.post("/usersTransaction", userController.createUserTransaction);
userRoutes.get("/users/:id", userController.getUserById);
userRoutes.put("/users/:id", userController.updateUser);
userRoutes.delete("/users/:id", userController.deleteUser);
*/

export default userRoutes;
