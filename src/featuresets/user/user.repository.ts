import pool from "../../db";
import { Consumable, CreateCreatureData, CreateCreatureResults, Creature, CreatureProperties, CreatureType, Currency, EAbilities, EClass, ECreatureType, EEquipment, Equipment, ERace, Inventory } from "./user.schema"

/**
 * Handles all db operations on the User table.
 */
class UserRepository {

    constructor() {
        
    }

    public async createCreature(creatureData: CreateCreatureData): Promise<CreateCreatureResults> {
        const createCreaturePropertiesQuery = 'INSERT INTO creature_properties (lvl, xp, hp, abilities) VALUES ($1, $2, $3, $4) RETURNING *';
        const createCreatureTypeQuery = 'INSERT INTO creature_types (class, race, c_type) VALUES ($1, $2, $3) RETURNING *';
        const createInventoryQuery = 'INSERT INTO inventories (equipment_capacity, consumables_capacity, equipment_ids, consumable_ids, currency_ids) VALUES ($1, $2, $3, $4, $5) RETURNING *';
        const createCreatureQuery = 'INSERT INTO creatures (creature_name, creature_type, creature_properties_id, creature_type_id, inventory_id, equipped_ids) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *';

        const equippedIds: number[] = new Array(EEquipment.SIZE).fill(null);
        const abilities: number[] = creatureData.abilities;


        let results: CreateCreatureResults;
        const connection = await pool.connect();
        try { 
            await connection.query('BEGIN');
            const properties = (await pool.query(createCreaturePropertiesQuery, [1, 0, creatureData.hp, abilities])).rows[0];
            const type = (await pool.query(createCreatureTypeQuery, [creatureData.class, creatureData.race, creatureData.type])).rows[0];
            const inventory = (await pool.query(createInventoryQuery, [creatureData.equipment_capacity, creatureData.consumables_capacity, [], [], []])).rows[0];
            const creature = (await pool.query(createCreatureQuery, [creatureData.name, creatureData.type, properties.id, type.id, inventory.id, equippedIds])).rows[0];

            results = {
                abilities,
                properties,
                type,
                inventory,
                creature,
                equipped: new Array(EEquipment.SIZE).fill(null)
            };

            await connection.query('COMMIT');
        } catch (e) {
            await connection.query('ROLLBACK');
            throw e;
        } finally {
            await connection.release();
        }

        return results;
    }

    public async getCreatures(type?: ECreatureType): Promise<Creature[]> {
        let getCreaturesQuery =
            'SELECT * FROM creatures AS c \
             LEFT JOIN inventories AS i ON c.inventory_id = i.id \
             LEFT JOIN creature_types AS ct ON c.creature_type_id = ct.id \
             LEFT JOIN ( \
                SELECT crp.id, crp.lvl, crp.xp, crp.hp, crp.abilities FROM creature_properties AS crp \
             ) cp ON c.creature_properties_id = cp.id';

        // TODO: get list of creatures in game instance

        const creatures: Creature[] = [];
        let getCreaturesValues = [];

        if (type) {
            getCreaturesQuery += ' WHERE creature_type = $1';
            getCreaturesValues.push(type);
        }

        let creatureResults = (await pool.query(getCreaturesQuery, getCreaturesValues)).rows;

        // TODO: all this logic should be in the service
        // Get the equipped and inventory items
        for (let i = 0; i < creatureResults.length; ++i) {
            const creatureResult = creatureResults[i];

            const creature: Creature = {
                id: creatureResult.id,
                name: creatureResult.creature_name,
                creature_type: creatureResult.creature_type,
                properties: {
                    id: creatureResult.creature_properties_id,
                    lvl: creatureResult.lvl,
                    xp: creatureResult.xp,
                    hp: creatureResult.hp,
                    abilities: creatureResult.abilities
                },
                type: {
                    id: creatureResult.creature_type_id,
                    class: creatureResult.class,
                    race: creatureResult.race,
                    c_type: creatureResult.c_type
                },
                inventory: {
                    id: creatureResult.inventory_id,
                    equipment_capacity: creatureResult.equipment_capacity,
                    consumables_capacity: creatureResult.consumables_capacity,
                } as Inventory,
            } as Creature;

            // TODO: test all of these
            const [equipped, equipment, consumables, currencies] = await Promise.all([
                this.getEquipment(creatureResult.equipped),
                this.getEquipment(creatureResult.equipment_ids),
                this.getConsumables(creatureResult.consumable_ids),
                this.getCurrencies(creatureResult.currency_ids)
            ])

            creature.equipped = equipped;
            creature.inventory.equipment = equipment;
            creature.inventory.consumables = consumables;
            creature.inventory.currencies = currencies;

            creatures.push(creature);
        }

        console.log(`creature: ${JSON.stringify(creatures[0])}`);

        return creatures;
    }

    public async getCreature(id: string): Promise<Creature[]> {
        const result = await pool.query('SELECT * FROM creatures WHERE id = $1', [id]); // TODO: filter out non-monsters and JOIN a bunch of tables
        const monsters: Creature[] = result.rows;

        return monsters; // temp
    }

    public async updateCreature(creatureData: CreateCreatureData): Promise<Creature[]> {
        return [];
        // TODO: CreateCreatureData can use UpdateCreatureData with Omit<>
        // TODO: for each 'object' in creatureData, perform an update on that table (need to get the id from the main creature object first)
        /*
        const createAbilitiesQuery = 'INSERT INTO abilities (strength, dexterity, constitution, intelligence, wisdom, charisma) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *'
        const createCreaturePropertiesQuery = 'INSERT INTO creature_properties (lvl, xp, hp, abilities_id) VALUES ($1, $2, $3, $4) RETURNING *';
        const createCreatureTypeQuery = 'INSERT INTO creature_types (class, race, creature_type) VALUES ($1, $2, $3) RETURNING *';
        const createInventoryQuery = 'INSERT INTO inventories (capacity, item_ids, currency_ids) VALUES ($1, $2, $3) RETURNING *';
        const createCreatureQuery = 'INSERT INTO creatures (creature_name, creature_properties_id, creature_type_id, inventory_id, equipped_ids) VALUES ($1, $2, $3, $4, $5) RETURNING *';

        const equippedIds: number[] = new Array(EEquipment.SIZE).fill(null);
        const abilities: number[] = creatureData.abilities;


        let results: CreateCreatureResults;
        const connection = await pool.connect();
        try { 
            await connection.query('BEGIN');
            const abilitiesResults = await pool.query(createAbilitiesQuery, [abilities[EAbilities.STRENGTH], abilities[EAbilities.DEXTERITY], abilities[EAbilities.CONSTITUTION], abilities[EAbilities.INTELLIGENCE], abilities[EAbilities.WISDOM], abilities[EAbilities.CHARISMA]]);
            const propertiesResults = await pool.query(createCreaturePropertiesQuery, [1, 0, creatureData.hp, abilitiesResults.rows[0].id]);
            const typeResults = await pool.query(createCreatureTypeQuery, [creatureData.class, creatureData.race, creatureData.type]);
            const inventoryResults = await pool.query(createInventoryQuery, [creatureData.inventory_capacity, [], []]);
            const creatureResults = await pool.query(createCreatureQuery, [creatureData.name, propertiesResults.rows[0].id, typeResults.rows[0].id, inventoryResults.rows[0].id, equippedIds]);

            results = {
                abilities,
                properties: propertiesResults.rows[0],
                type: typeResults.rows[0],
                inventory: inventoryResults.rows[0],
                creature: creatureResults.rows[0],
                equipped: new Array(EEquipment.SIZE).fill(null)
            };

            await connection.query('COMMIT');
        } catch (e) {
            await connection.query('ROLLBACK');
            throw e;
        } finally {
            await connection.release();
        }

        return results;
        */
    }

    public async getEquipment(equipmentIds: number[]): Promise<Equipment[]> {
        if (!(equipmentIds?.length > 0)) {
            return [];
        }

        const equipmentRows = (await pool.query('SELECT * FROM equipment WHERE id = ANY ($1::int[])', [equipmentIds])).rows;
        console.log(`equipmentdResults: ${JSON.stringify(equipmentRows)}`);
        const equipmentArray: Equipment[] = [];

        for(let i = 0; i < equipmentRows.length; ++i) {
            const equipmentRow = equipmentRows[i];
            const equipment: Equipment = {
                id: equipmentRow.id,
                name: equipmentRow.equipment_name,
                type: equipmentRow.equipment_type,
                ability_modifiers: equipmentRow.ability_modifiers
            };
            equipmentArray.push(equipment);
        }

        return equipmentArray;
    }

    public async getConsumables(consumableIds: number[]): Promise<Consumable[]> {
        if (!(consumableIds?.length > 0)) {
            return [];
        }

        const consumableRows = (await pool.query('SELECT * FROM consumables WHERE id = ANY ($1::int[])', [consumableIds])).rows;
        console.log(`consumableRows: ${JSON.stringify(consumableRows)}`);
        const consumables: Consumable[] = [];

        for(let i = 0; i < consumableRows.length; ++i) {
            const consumablesRow = consumableRows[i];
            const consumable: Consumable = {
                id: consumablesRow.id,
                name: consumablesRow.consumable_name,
                type: consumablesRow.consumable_type,
            };
            consumables.push(consumable);
        }

        return consumables;
    }
    
    public async getCurrencies(currencyIds: number[]): Promise<Currency[]> {
        if (!(currencyIds?.length > 0)) {
            return [];
        }
    
        const currencyRows = (await pool.query('SELECT * FROM currencies WHERE id = ANY ($1::int[])', [currencyIds])).rows;
        console.log(`currencyRows: ${JSON.stringify(currencyRows)}`);
        const currencies: Currency[] = [];

        for(let i = 0; i < currencyRows.length; ++i) {
            const currencyRow = currencyRows[i];
            const currency: Currency = {
                id: currencyRow.id,
                type: currencyRow.currency_type,
                total: currencyRow.total
            };
            currencies.push(currency);
        }

        return currencies;
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

export default UserRepository;
