import { Router } from "express";
import UserController from "./user.controller";
import UserRepository from "./user.repository";
import UserService from "./user.service";

const userRoutes = Router();
const userRepository = new UserRepository();
const userService = new UserService(userRepository);
const userController = new UserController(userService);


/* ADMIN ROUTES */
userRoutes.post('/monster', userController.createMonster.bind(userController));
userRoutes.put('/monster/:id', userController.updateMonster.bind(userController));
userRoutes.delete('/monster/:id', userController.deleteMonster.bind(userController));

userRoutes.post('/character', userController.createCharacter.bind(userController));
userRoutes.put('/character/:id', userController.updateCharacter.bind(userController));
userRoutes.delete('/character/:id', userController.deleteCharacter.bind(userController));

// userRoutes.post('/npc', userController.createNpc.bind(userController));
// userRoutes.put('/npc/:id', userController.updateNpc.bind(userController));
// userRoutes.delete('/npc/:id', userController.deleteNpc.bind(userController));

/* PLAYER ROUTES */

/* SHARED ROUTES */
userRoutes.get('/monster', userController.getMonsters.bind(userController));
userRoutes.get('/monster/:id', userController.getMonster.bind(userController));

userRoutes.get('/character', userController.getCharacters.bind(userController));
userRoutes.get('/character/:id', userController.getCharacter.bind(userController));

// userRoutes.get('/npc', userController.getNpcs.bind(userController));
// userRoutes.get('/npc/:id', userController.getNpc.bind(userController));

export default userRoutes;
