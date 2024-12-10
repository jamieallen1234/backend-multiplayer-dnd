import { Request, Response } from "express";
import pool from "../../db";
import { QueryResult } from "pg";
import UserService from "./user.service";
import { CreateCreatureData, CreateGameData, ECreatureType, UpdateCreatureData } from "./user.schema";

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
}

export default UserController;
