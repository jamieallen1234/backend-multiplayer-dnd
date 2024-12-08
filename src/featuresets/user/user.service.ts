import pool from "../../db";
import UserRepository from "./user.repository";
import { CreateCreatureData, CreateCreatureResults, Creature, ECreatureType } from "./user.schema";

/**
 * Handles all db operations on the User table.
 */
class UserService {

    private _userRepository: UserRepository;

    constructor(userRepository: UserRepository) {
        this._userRepository = userRepository;
    }

    public async createMonster(monsterDetails: CreateCreatureData): Promise<Creature> {
        if (monsterDetails.type !== ECreatureType.MONSTER) {
            throw new Error('Could not create monster because type was not of monster');
        }
        const monsterResults: CreateCreatureResults = await this._userRepository.createCreature(monsterDetails);

        return this.mapCreatureResultsToCreature(monsterResults);
    }

    public async getMonsters(): Promise<Creature[]> {
        const monsters = await this._userRepository.getCreatures(ECreatureType.MONSTER);
        return monsters;
    }

    private mapCreatureResultsToCreature(data: CreateCreatureResults): Creature {
        const creature: Creature = { // TODO: assign properties manually (or do it in the repository)
            id: data.creature.id,
            name: data.creature.name,
            creature_type: data.creature.creature_type,
            properties: data.properties,
            type: data.type,
            inventory: data.inventory,
            equipped: data.equipped
        };

        return creature;
    }

    /*
    public async getIndex(): Promise<User[]> {
        const result = await pool.query("SELECT * FROM users");
        const users: User[] = result.rows;
        return users;
    }

    public async createUser(): Promise<void> {

    }

    public async getUserById(): Promise<void> {

    }

    public async updateUser(): Promise<void> {

    }

    public async deleteUser(): Promise<void> {

    }

    public async createUserTransaction(): Promise<void> {

    }
    */
}

export default UserService;
