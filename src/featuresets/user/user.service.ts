import pool from "../../db";
import UserRepository from "./user.repository";
import { CreateCreatureData, CreateCreatureResults, Creature, ECreatureType, GetCreatureRow, Inventory, UpdateCreatureData } from "./user.schema";

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

        return this.createCreature(monsterDetails);
    }

    public async createCreature(creatureDetails: CreateCreatureData): Promise<Creature> {
        const creatureResults: CreateCreatureResults = await this._userRepository.createCreature(creatureDetails);

        return this.mapCreatureResultsToCreature(creatureResults);
    }

    public async updateCreature(creatureId: number, creatureData: UpdateCreatureData): Promise<boolean> {
        if (!creatureData.properties?.id) {
            throw new Error(`Could not update creature ${creatureId} because properties is missing`);
        } else if (!creatureData.type?.id) {
            throw new Error(`Could not update creature ${creatureId} because type is missing`);
        } else if (!creatureData.inventory?.id) {
            throw new Error(`Could not update creature ${creatureId} because inventory is missing`);
        }
        
        const updated = await this._userRepository.updateCreature(creatureId, creatureData);

        return updated;
    }

    public async deleteCreature(id: number, type: ECreatureType): Promise<boolean> {
        const deleted = await this._userRepository.deleteCreature(id, type);

        return deleted;
    }

    public async getCreature(id: number, type: ECreatureType): Promise<Creature> {
        return (await this.getCreatures([id], type))[0];
    }

    public async getCreatures(ids?: number[], type?: ECreatureType): Promise<Creature[]> {
        const creatureRows: GetCreatureRow[] = await this._userRepository.getCreatures(ids, type);

        const creatures: Creature[] = [];

        // Get the equipped and inventory items
        for (let i = 0; i < creatureRows.length; ++i) {
            const creatureRow = creatureRows[i];

            const creature: Creature = {
                id: creatureRow.id,
                creature_name: creatureRow.creature_name,
                creature_type: creatureRow.creature_type,
                properties: {
                    id: creatureRow.creature_properties_id,
                    lvl: creatureRow.lvl,
                    xp: creatureRow.xp,
                    hp: creatureRow.hp,
                    abilities: creatureRow.abilities
                },
                type: {
                    id: creatureRow.creature_type_id,
                    class: creatureRow.class,
                    race: creatureRow.race,
                    c_type: creatureRow.creature_type
                },
                inventory: {
                    id: creatureRow.inventory_id,
                    equipment_capacity: creatureRow.equipment_capacity,
                    consumables_capacity: creatureRow.consumables_capacity,
                } as unknown as Inventory, // Add the missing bits down below
            } as Creature;

            // TODO: test all of these
            const [equipped, equipment, consumables, currencies] = await Promise.all([
                this._userRepository.getEquipment(creatureRow.equipped),
                this._userRepository.getEquipment(creatureRow.equipment_ids),
                this._userRepository.getConsumables(creatureRow.consumable_ids),
                this._userRepository.getCurrencies(creatureRow.currency_ids)
            ]);

            creature.equipped = equipped;
            creature.inventory.equipment = equipment;
            creature.inventory.consumables = consumables;
            creature.inventory.currencies = currencies;

            creatures.push(creature);
        }

        return creatures;
    }

    private mapCreatureResultsToCreature(data: CreateCreatureResults): Creature {
        const creature: Creature = {
            id: data.creature.id,
            creature_name: data.creature.creature_name,
            creature_type: data.creature.creature_type,
            properties: data.properties,
            type: data.type,
            inventory: data.inventory,
            equipped: data.equipped
        };

        console.log(`Mapped creature: ${JSON.stringify(creature)}`);

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
