import { Request, Response } from "express";
import UserService from "./user.service";
import { CreateCreatureData, CreateGameData, ECreatureType, UpdateCreatureData, UpdateGameData } from "./user.schema";

// https://node-postgres.com/features/queries
class UserController {
    private userService: UserService;
    constructor(userService: UserService) {
        this.userService = userService;
    }

    public async createMonster(req: Request, res: Response): Promise<void> {
        const monsterDetails: CreateCreatureData = req.body.monsterDetails;
        const monster = await this.userService.createMonster(monsterDetails);
        
        res.status(200).json(monster);
    }

    public async updateMonster(req: Request, res: Response): Promise<void> {
        const monsterData: UpdateCreatureData = req.body.monsterData;
        const monster = await this.userService.updateCreature(Number(req.params.id), monsterData);
        
        res.status(200).json(monster);
    }

    public async getMonsters(req: Request, res: Response): Promise<void> {
        const monsters = await this.userService.getCreatures(undefined, ECreatureType.MONSTER);
        
        res.status(200).json(monsters);
    }

    public async getMonster(req: Request, res: Response): Promise<void> {
        const monster = await this.userService.getCreature(Number(req.params.id), ECreatureType.MONSTER);
        
        res.status(200).json(monster);
    }

    public async deleteMonster(req: Request, res: Response): Promise<void> {
        const result = await this.userService.deleteCreature(Number(req.params.id), ECreatureType.MONSTER);
        
        res.status(200).json(result);
    }

    public async createCharacter(req: Request, res: Response): Promise<void> {
        const characterData: CreateCreatureData = req.body.characterData;
        const character = await this.userService.createCharacter(characterData);
        
        res.status(200).json(character);
    }

    public async updateCharacter(req: Request, res: Response): Promise<void> {
        const characterData: UpdateCreatureData = req.body.characterData;
        const character = await this.userService.updateCreature(Number(req.params.id), characterData);
        
        res.status(200).json(character);
    }

    public async getCharacters(req: Request, res: Response): Promise<void> {
        const characters = await this.userService.getCreatures(undefined, ECreatureType.CHARACTER);
        
        res.status(200).json(characters);
    }

    public async getCharacter(req: Request, res: Response): Promise<void> {
        const character = await this.userService.getCreature(Number(req.params.id), ECreatureType.CHARACTER);
        
        res.status(200).json(character);
    }

    public async deleteCharacter(req: Request, res: Response): Promise<void> {
        const result = await this.userService.deleteCreature(Number(req.params.id), ECreatureType.CHARACTER);
        
        res.status(200).json(result);
    }

    public async createGame(req: Request, res: Response): Promise<void> {
        const gameData: CreateGameData = req.body.gameData;
        const result = await this.userService.createGame(gameData);
        
        res.status(200).json(result);
    }

    public async updateGame(req: Request, res: Response): Promise<void> {
        const gameData: UpdateGameData = req.body.gameData;
        const result = await this.userService.updateGame(Number(req.params.id), gameData);
        
        res.status(200).json(result);
    }

    public async getGame(req: Request, res: Response): Promise<void> {
        const result = await this.userService.getGame(Number(req.params.id));
        
        res.status(200).json(result);
    }

    public async startGame(req: Request, res: Response): Promise<void> {
        const result = await this.userService.startGame(Number(req.params.id));
        
        res.status(200).json(result);
    }

    public async getAvailablePartyList(req: Request, res: Response): Promise<void> {
        const result = await this.userService.getAvailablePartyList();
        
        res.status(200).json(result);
    }

    public async getAvailableDungeonMasterList(req: Request, res: Response): Promise<void> {
        const result = await this.userService.getAvailableDungeonMasterList();
        
        res.status(200).json(result);
    }

    public async createTreasure(req: Request, res: Response): Promise<void> {
        const result = await this.userService.createTreasure(req.body.treasureData);
        
        res.status(200).json(result);
    }

    public async getTreasure(req: Request, res: Response): Promise<void> {
        const result = await this.userService.getTreasure(Number(req.params.id));
        
        res.status(200).json(result);
    }

    public async updateTreasure(req: Request, res: Response): Promise<void> {
        const result = await this.userService.updateTreasure(Number(req.params.id), req.body.treasureData);
        
        res.status(200).json(result);
    }

    public async deleteTreasure(req: Request, res: Response): Promise<void> {
        const result = await this.userService.deleteTreasure(Number(req.params.id));
        
        res.status(200).json(result);
    }

    public async openTreasureInstance(req: Request, res: Response): Promise<void> {
        const result = await this.userService.openTreasureInstance(Number(req.params.treasure_id), Number(req.params.party_id));
        
        res.status(200).json(result);
    }

    public async joinGameAsDungeonMaster(req: Request, res: Response): Promise<void> {
        const result = await this.userService.joinGameAsDungeonMaster(Number(req.params.game_id), req.params.user_id, req.body.user_name);
        
        res.status(200).json(result);
    }

    public async joinGameAsPlayer(req: Request, res: Response): Promise<void> {
        const result = await this.userService.joinGameAsPlayer(Number(req.params.game_id), req.params.user_id, req.body.user_name, req.body.character_id);
        
        res.status(200).json(result);
    }

    public async beginCombat(req: Request, res: Response): Promise<void> {
        const result = await this.userService.beginCombat(Number(req.params.game_id), req.body.location);
        
        res.status(200).json(result);
    }

    public async moveParty(req: Request, res: Response): Promise<void> {
        const result = await this.userService.moveParty(Number(req.params.game_id), Number(req.params.player_id), req.body.direction);
        
        res.status(200).json(result);
    }

    public async takeCombatTurn(req: Request, res: Response): Promise<void> {
        const result = await this.userService.takeCombatTurnForCombatant(Number(req.params.game_id), Number(req.params.combat_id), req.body.attacker_combatant_id, req.body.defender_combatant_id);
        
        res.status(200).json(result);
    }
}

export default UserController;
