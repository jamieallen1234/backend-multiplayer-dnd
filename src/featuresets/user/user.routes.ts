import { Router } from "express";
import { checkForAdminToken, checkForSharedToken, checkForUserToken } from "../../middleware/auth";
import UserController from "./user.controller";
import UserRepository from "./user.repository";
import UserService from "./user.service";
import "express-async-errors";

const userRoutes = Router();
const userRepository = new UserRepository();
const userService = new UserService(userRepository);
const userController = new UserController(userService);

/*************************
/* ADMIN/DM ROUTES
/*************************/
// Monster
userRoutes.post('/monster', checkForAdminToken, userController.createMonster.bind(userController));
userRoutes.put('/monster/:id', checkForAdminToken, userController.updateMonster.bind(userController));
userRoutes.delete('/monster/:id', checkForAdminToken, userController.deleteMonster.bind(userController));

// Character
userRoutes.post('/character', checkForAdminToken, userController.createCharacter.bind(userController));
userRoutes.put('/character/:id', checkForAdminToken, userController.updateCharacter.bind(userController));
userRoutes.delete('/character/:id', checkForAdminToken, userController.deleteCharacter.bind(userController));

// Treaure
userRoutes.post('/treasure', checkForAdminToken, userController.createTreasure.bind(userController));
userRoutes.put('/treasure/:id', checkForAdminToken, userController.updateTreasure.bind(userController));
userRoutes.delete('/treasure/:id', checkForAdminToken, userController.deleteTreasure.bind(userController));

// Treasure Instance
userRoutes.put('/treasure/:treasure_id/open/:party_id', checkForAdminToken, userController.openTreasureInstance.bind(userController));

// Game
userRoutes.patch('/game/:game_id/join/:user_id/dm', checkForAdminToken, userController.joinGameAsDungeonMaster.bind(userController));

// Combat
userRoutes.post('/game/:game_id/combat', checkForAdminToken, userController.beginCombat.bind(userController));


/*************************
/* USER/PLAYER ROUTES
/*************************/
// Game
userRoutes.patch('/game/:game_id/join/:user_id/player', checkForUserToken, userController.joinGameAsPlayer.bind(userController));

// Party
userRoutes.patch('/game/:game_id/party/:player_id/move', checkForUserToken, userController.moveParty.bind(userController));


/*************************
/* SHARED ROUTES
/*************************/
// Monster
userRoutes.get('/monster', checkForSharedToken, userController.getMonsters.bind(userController));
userRoutes.get('/monster/:id', checkForSharedToken, userController.getMonster.bind(userController));

// Character
userRoutes.get('/character', checkForSharedToken, userController.getCharacters.bind(userController));
userRoutes.get('/character/:id', checkForSharedToken, userController.getCharacter.bind(userController));

// Treasure
userRoutes.get('/treasure/:id', checkForSharedToken, userController.getTreasure.bind(userController));

// Game
userRoutes.post('/game', checkForSharedToken, userController.createGame.bind(userController));
userRoutes.get('/game/:id', checkForSharedToken, userController.getGame.bind(userController));
userRoutes.patch('/game/:id/start', checkForSharedToken, userController.startGame.bind(userController));
userRoutes.put('/game/:id', checkForSharedToken, userController.updateGame.bind(userController)); // Added for the test but safer to use targeted endpoints such as start game

// Combat
userRoutes.patch('/game/:game_id/combat/:combat_id', checkForSharedToken, userController.takeCombatTurn.bind(userController));

// Lobby
userRoutes.get('/game/lobby/party', checkForSharedToken, userController.getAvailablePartyList.bind(userController));
userRoutes.get('/game/lobby/dm', checkForSharedToken, userController.getAvailableDungeonMasterList.bind(userController));


/* Future endpoints */
// Game
/* userRoutes.delete('/game/:id', checkForSharedToken, userController.endGame.bind(userController)); */

// NPC
/* userRoutes.post('/npc', userController.createNpc.bind(userController));
   userRoutes.put('/npc/:id', userController.updateNpc.bind(userController));
   userRoutes.delete('/npc/:id', userController.deleteNpc.bind(userController));
   userRoutes.get('/npc', userController.getNpcs.bind(userController));
   userRoutes.get('/npc/:id', userController.getNpc.bind(userController));*/

// Party
/* userRoutes.get('/game/:game_id:/party/leave', checkForSharedToken, userController.leaveParty.bind(userController));
   userRoutes.get('/game/:game_id/rejoin/:user_id/user', checkForSharedToken, userController.rejoinGame.bind(userController)); */

// Inventory / Equipment
/* userRoutes.get('/character/:char_id/equip/:equipment_id', checkForSharedToken, userController.equipCharacter.bind(userController));
   userRoutes.get('/character/:char_id/use_item/:item_id', checkForSharedToken, userController.useItem.bind(userController));
   userRoutes.get('/character/:char_id/drop_item/:item_id', checkForSharedToken, userController.dropItem.bind(userController)); */

export default userRoutes;
