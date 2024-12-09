import { Router } from "express";
import UserController from "./user.controller";
import UserRepository from "./user.repository";
import UserService from "./user.service";

const userRoutes = Router();
const userRepository = new UserRepository();
const userService = new UserService(userRepository);
const userController = new UserController(userService);


/*
userRoutes.get("/users", userController.getIndex);
userRoutes.post("/users", userController.createUser);
userRoutes.post("/usersTransaction", userController.createUserTransaction);
userRoutes.get("/users/:id", userController.getUserById);
userRoutes.put("/users/:id", userController.updateUser);
userRoutes.delete("/users/:id", userController.deleteUser);
*/
userRoutes.get("/users", userController.getIndex.bind(userController));

// Create, Read, Update, Delete

// Admin Routes
userRoutes.post('/monster', userController.createMonster.bind(userController));
userRoutes.put('/monster/:id', userController.updateMonster.bind(userController));
userRoutes.delete('/monster/:id', userController.deleteMonster.bind(userController));

// Player Routes

// Shared Routes
userRoutes.get('/monster', userController.getMonsters.bind(userController));
userRoutes.get('/monster/:id', userController.getMonster.bind(userController));

export default userRoutes;
