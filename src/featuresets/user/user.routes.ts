import { Router } from "express";
import { checkForAdminToken, checkForSharedToken } from "../../middleware/auth";
import UserController from "./user.controller";
import UserRepository from "./user.repository";
import UserService from "./user.service";

const userRoutes = Router();
const userRepository = new UserRepository();
const userService = new UserService(userRepository);
const userController = new UserController(userService);


/* ADMIN/DM ROUTES */
userRoutes.post('/monster', checkForAdminToken, userController.createMonster.bind(userController));
userRoutes.put('/monster/:id', checkForAdminToken, userController.updateMonster.bind(userController));
userRoutes.delete('/monster/:id', checkForAdminToken, userController.deleteMonster.bind(userController));

userRoutes.post('/character', checkForAdminToken, userController.createCharacter.bind(userController));
userRoutes.put('/character/:id', checkForAdminToken, userController.updateCharacter.bind(userController));
userRoutes.delete('/character/:id', checkForAdminToken, userController.deleteCharacter.bind(userController));

// userRoutes.post('/npc', userController.createNpc.bind(userController));
// userRoutes.put('/npc/:id', userController.updateNpc.bind(userController));
// userRoutes.delete('/npc/:id', userController.deleteNpc.bind(userController));

/* PLAYER ROUTES */

/* SHARED ROUTES */
userRoutes.get('/monster', checkForSharedToken, userController.getMonsters.bind(userController));
userRoutes.get('/monster/:id', checkForSharedToken, userController.getMonster.bind(userController));

userRoutes.get('/character', checkForSharedToken, userController.getCharacters.bind(userController));
userRoutes.get('/character/:id', checkForSharedToken, userController.getCharacter.bind(userController));

userRoutes.post('/game', checkForSharedToken, userController.createGame.bind(userController));

// userRoutes.get('/npc', userController.getNpcs.bind(userController));
// userRoutes.get('/npc/:id', userController.getNpc.bind(userController));

export default userRoutes;
