import pool from "../../db";
import { Consumable, CreateCreatureData, CreateCreatureResults, Creature, CreatureProperties, CreatureType, Currency, EAbilities, EClass, ECreatureType, EEquipment, Equipment, ERace, GetCreatureRow, Inventory, UpdateCreatureData } from "./user.schema"

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

    public async getCreatures(ids?: number[], type?: ECreatureType): Promise<GetCreatureRow[]> {
        let getCreaturesQuery =
            'SELECT * FROM creatures AS c \
             LEFT JOIN inventories AS i ON c.inventory_id = i.id \
             LEFT JOIN creature_types AS ct ON c.creature_type_id = ct.id \
             LEFT JOIN ( \
                SELECT crp.id, crp.lvl, crp.xp, crp.hp, crp.abilities FROM creature_properties AS crp \
             ) cp ON c.creature_properties_id = cp.id';

        // TODO: filter list of creatures in game instance

        let getCreaturesValues = [];

        if ((ids?.length ?? 0) > 0) {
            getCreaturesQuery += ' WHERE c.id = ANY ($1::int[])';
            getCreaturesValues.push(ids);
        }

        if (type) {
            getCreaturesQuery += ` ${getCreaturesValues.length === 0 ? 'WHERE' : 'AND'} c.creature_type = ${getCreaturesValues.length === 0  ? '$1' : '$2'}`;
            getCreaturesValues.push(type);
        }

        let creatureRows = (await pool.query(getCreaturesQuery, getCreaturesValues)).rows;

        console.log(`creatureRows: ${JSON.stringify(creatureRows)}`);

        return creatureRows;
    }

    public async getCreature(id: number, type: ECreatureType): Promise<GetCreatureRow> {
        return (await this.getCreatures([id], type))[0];
    }

    public async deleteCreature(id: number, type: ECreatureType): Promise<boolean> {
        const creatureRow = (await pool.query('SELECT * FROM creatures WHERE id = $1', [id])).rows[0];

        if (!creatureRow) {
            console.warn(`Could not update creature ${id} because it could not be found.`);
            return false;
        }

        if (creatureRow.creature_type !== type) {
            throw new Error(`Could not delete creature ${id} because creature type ${creatureRow.creature_type} did not match ${type}`);
        }

        const result = await pool.query('DELETE FROM creatures WHERE id = $1', [id]);

        return (result?.rowCount ?? 0) > 1;
    }

    /**
     * This update does a full replace for a creature and all of its components.
     */
    public async updateCreature(id: number, creatureData: UpdateCreatureData): Promise<boolean> {
        const creatureRow = (await pool.query('SELECT * FROM creatures WHERE id = $1', [id])).rows[0];

        if (!creatureRow) {
            throw new Error(`Could not update creature ${id} because it could not be found.`);
        }

        const connection = await pool.connect();
        try { 
            await connection.query('BEGIN');

            let updateCreatureQuery = 'UPDATE creatures SET';
            const updateCreatureValues = [];
            let index = 1;

            const equipped_ids: number[] = creatureData.equipped.map((equipment) => equipment?.id ?? null);
            updateCreatureQuery += ` equipped_ids = $${index++}`;
            updateCreatureValues.push(equipped_ids);

            if (creatureData.creature_name !== creatureRow.creature_name) {
                updateCreatureQuery += `, creature_name = $${index++}`;
                updateCreatureValues.push(creatureData.creature_name);
            }
            if (creatureData.creature_type !== creatureRow.creature_type) {
                updateCreatureQuery += `, creature_type = $${index++}`;
                updateCreatureValues.push(creatureData.creature_type);
            }
            if (creatureData.properties.id !== creatureRow.creature_properties_id) {
                updateCreatureQuery += `, creature_properties_id = $${index++}`;
                updateCreatureValues.push(creatureData.properties.id);
            }
            if (creatureData.type.id !== creatureRow.creature_type_id) {
                updateCreatureQuery += `, creature_type_id = $${index++}`;
                updateCreatureValues.push(creatureData.type.id);
            }
            if (creatureData.inventory.id !== creatureRow.inventory_type_id) {
                updateCreatureQuery += `, inventory_id = $${index++}`;
                updateCreatureValues.push(creatureData.inventory.id);
            }

            updateCreatureQuery += ` WHERE id = $${index++} RETURNING *`;
            updateCreatureValues.push(id);

            const updatedCreatureRow = (await pool.query(updateCreatureQuery, updateCreatureValues)).rows[0];
            console.log(`Updated creature row to ${updatedCreatureRow}`);

            // TODO: the 3 following need to use the connection for rollback purposes
            await this.updateCreatureProperties(creatureData.properties);
            await this.updateCreatureType(creatureData.type);
            await this.updateInventory(creatureData.inventory);

            await connection.query('COMMIT');
        } catch (e) {
            await connection.query('ROLLBACK');
            throw e;
        } finally {
            await connection.release();
        }
        
        return true;
    }

    public async updateCreatureProperties(creatureProperties: CreatureProperties): Promise<boolean> {
        let getPropertiesQuery = 'SELECT * FROM creature_properties WHERE id = $1';
        const propertiesRow = (await pool.query(getPropertiesQuery, [creatureProperties.id])).rows[0];

        if (!propertiesRow) {
            throw new Error(`Could not update creature properties ${creatureProperties.id} because it could not be found.`);
        }

        let updatePropertiesQuery = 'UPDATE creature_properties SET';
        const updatePropertiesValues = [];
        let index = 1;

        updatePropertiesQuery += ` abilities = $${index++}`;
        updatePropertiesValues.push(creatureProperties.abilities);

        if (creatureProperties.lvl !== propertiesRow.lvl) {
            updatePropertiesQuery += `, lvl = $${index++}`;
            updatePropertiesValues.push(creatureProperties.lvl);
        }
        if (creatureProperties.xp !== propertiesRow.xp) {
            updatePropertiesQuery += `, xp = $${index++}`;
            updatePropertiesValues.push(creatureProperties.xp);
        }
        if (creatureProperties.hp !== propertiesRow.hp) {
            updatePropertiesQuery += `, hp = $${index++}`;
            updatePropertiesValues.push(creatureProperties.hp);
        }

        updatePropertiesQuery += ` WHERE id = $${index++} RETURNING *`;
        updatePropertiesValues.push(creatureProperties.id);

        const updatedPropertiesRow = (await pool.query(updatePropertiesQuery, updatePropertiesValues)).rows[0];

        console.log(`Updated properties row to: ${JSON.stringify(updatedPropertiesRow)}`);

        return true;
    }

    public async updateCreatureType(creatureType: CreatureType): Promise<boolean> {
        let getTypeQuery = 'SELECT * FROM creature_types WHERE id = $1';
        const typeRow = (await pool.query(getTypeQuery, [creatureType.id])).rows[0];

        if (!typeRow) {
            throw new Error(`Could not update creature type ${creatureType.id} because it could not be found.`);
        }

        let updateTypeQuery = 'UPDATE creature_types SET';
        const updateTypeValues = [];
        let index = 1;

        updateTypeQuery += ` class = $${index++}`;
        updateTypeValues.push(creatureType.class);

        if (creatureType.race !== typeRow.race) {
            updateTypeQuery += `, race = $${index++}`;
            updateTypeValues.push(creatureType.race);
        }
        if (creatureType.c_type !== typeRow.c_type) {
            updateTypeQuery += `, c_type = $${index++}`;
            updateTypeValues.push(creatureType.c_type);
        }

        updateTypeQuery += ` WHERE id = $${index++} RETURNING *`;
        updateTypeValues.push(creatureType.id);

        const updatedTypeRow = (await pool.query(updateTypeQuery, updateTypeValues)).rows[0];

        console.log(`Updated type row to: ${JSON.stringify(updatedTypeRow)}`);

        return true;
    }

    public async updateInventory(inventoryData: Inventory): Promise<boolean> {
        let getInventoryQuery = 'SELECT * FROM inventories WHERE id = $1';
        const inventoryRow = (await pool.query(getInventoryQuery, [inventoryData.id])).rows[0];

        if (!inventoryRow) {
            throw new Error(`Could not update creature inventory ${inventoryData.id} because it could not be found.`);
        }

        let updateInventoryQuery = 'UPDATE inventories SET';
        const updateInventoryValues = [];
        let index = 1;

        const equipment_ids: number[] = inventoryData.equipment.map((equipment) => equipment.id);
        updateInventoryQuery += ` equipment_ids = $${index++}`;
        updateInventoryValues.push(equipment_ids);

        const consumable_ids: number[] = inventoryData.consumables.map((consumable) => consumable.id);
        updateInventoryQuery += `, consumable_ids = $${index++}`;
        updateInventoryValues.push(consumable_ids);

        const currency_ids: number[] = inventoryData.currencies.map((currency) => currency.id);
        updateInventoryQuery += `, currency_ids = $${index++}`;
        updateInventoryValues.push(currency_ids);

        if (inventoryData.equipment_capacity !== inventoryRow.equipment_capacity) {
            updateInventoryQuery += `, equipment_capacity = $${index++}`;
            updateInventoryValues.push(inventoryData.equipment_capacity);
        }
        if (inventoryData.consumables_capacity !== inventoryRow.consumables_capacity) {
            updateInventoryQuery += `, consumables_capacity = $${index++}`;
            updateInventoryValues.push(inventoryData.consumables_capacity);
        }

        updateInventoryQuery += ` WHERE id = $${index++} RETURNING *`;
        updateInventoryValues.push(inventoryData.id);

        const updatedInventoryRow = (await pool.query(updateInventoryQuery, updateInventoryValues)).rows[0];

        console.log(`Updated inventory row to: ${JSON.stringify(updatedInventoryRow)}`);

        return true;
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
