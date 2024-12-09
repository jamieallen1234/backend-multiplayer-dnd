import { Request, Response } from "express";
import pool from "../../db";
import { QueryResult } from "pg";
import UserService from "./user.service";
import { CreateCreatureData, ECreatureType, UpdateCreatureData } from "./user.schema";

// https://node-postgres.com/features/queries
class UserController {
    private userService: UserService;
    constructor(userService: UserService) {
        this.userService = userService;
    }

    public async createMonster(req: Request, res: Response): Promise<void> {
        try {
            const monsterDetails: CreateCreatureData = req.body.monsterDetails;
            const monster = await this.userService.createMonster(monsterDetails);
            
            res.status(200).json(monster);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: (error as Error).message });
        }
    }

    public async updateMonster(req: Request, res: Response): Promise<void> {
        try {
            const monsterData: UpdateCreatureData = req.body.monsterData;
            const monster = await this.userService.updateCreature(Number(req.params.id), monsterData);
            
            res.status(200).json(monster);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: (error as Error).message });
        }
    }

    public async getMonsters(req: Request, res: Response): Promise<void> {
        try {
            const monsters = await this.userService.getCreatures(undefined, ECreatureType.MONSTER);
            
            res.status(200).json(monsters);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: (error as Error).message });
        }
    }

    public async getMonster(req: Request, res: Response): Promise<void> {
        try {
            const monster = await this.userService.getCreature(Number(req.params.id), ECreatureType.MONSTER);
            
            res.status(200).json(monster);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: (error as Error).message });
        }
    }

    public async deleteMonster(req: Request, res: Response): Promise<void> {
        try {
            const result = await this.userService.deleteCreature(Number(req.params.id), ECreatureType.MONSTER);
            
            res.status(200).json(result);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: (error as Error).message });
        }
    }

    public async createCharacter(req: Request, res: Response): Promise<void> {
        try {
            const characterData: CreateCreatureData = req.body.characterData;
            const character = await this.userService.createCharacter(characterData);
            
            res.status(200).json(character);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: (error as Error).message });
        }
    }

    public async updateCharacter(req: Request, res: Response): Promise<void> {
        try {
            const characterData: UpdateCreatureData = req.body.characterData;
            const character = await this.userService.updateCreature(Number(req.params.id), characterData);
            
            res.status(200).json(character);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: (error as Error).message });
        }
    }

    public async getCharacters(req: Request, res: Response): Promise<void> {
        try {
            const characters = await this.userService.getCreatures(undefined, ECreatureType.CHARACTER);
            
            res.status(200).json(characters);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: (error as Error).message });
        }
    }

    public async getCharacter(req: Request, res: Response): Promise<void> {
        try {
            const character = await this.userService.getCreature(Number(req.params.id), ECreatureType.CHARACTER);
            
            res.status(200).json(character);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: (error as Error).message });
        }
    }

    public async deleteCharacter(req: Request, res: Response): Promise<void> {
        try {
            const result = await this.userService.deleteCreature(Number(req.params.id), ECreatureType.CHARACTER);
            
            res.status(200).json(result);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: (error as Error).message });
        }
    }
}

export default UserController;
