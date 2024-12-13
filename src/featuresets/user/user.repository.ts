import pool from "../../db";
import { BadRequestError } from "../../middleware/errors";
import { Combat, Combatant, Consumable, CreateCreatureData, CreateCreatureResults, CreateTreasureType, Creature, CreatureProperties, CreatureType, Currency, DungeonMaster, ECombatantType, ECreatureType, EEquipment, EInteractionType, EItemType, Equipment, ERace, Game, GameInfo, GameMap, Interaction, Inventory, InventoryRow, IteractionData, Location, mapArrayToRange, mapInteractionsArrayToInteractionsMap, mapInteractionsMapToInteractionsArray, mapRangeToArray, mapTreasureTypeRowToTreasureType, Party, PartyRow, Player, Range, Treasure, TreasureType, TreasureTypeRow, UpdateCreatureData, UpdateGameData, UpdateTreasureType } from "./user.schema"

/**
 * Handles all db operations on the User table.
 */
class UserRepository {

    constructor() {
        
    }

    /*****************************
     * Treasure Queries
     *****************************/

    /* Create treasure */
    public async createTreasure(treasureTypeId: number): Promise<number> {
        const createTreasureQuery = 'INSERT INTO treasure (treasure_type_id) VALUES ($1) RETURNING *';
        const createTreasureValues = [treasureTypeId];

        const treasureRow = (await pool.query(createTreasureQuery, createTreasureValues)).rows[0];

        return treasureRow.id;
    }

    /* Creates a treasure type */
    public async createTreasureType(data: CreateTreasureType): Promise<TreasureType> {
        const createTreasureTypeQuery = 'INSERT INTO treasure_type (equipment_ids, consumable_ids, currency_ids, num_equipment, num_consumables, num_currencies) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *';
        const createTreasureTypeValues = [data.equipment_ids, data.consumable_ids, data.currency_ids, mapRangeToArray(data.num_equipment), mapRangeToArray(data.num_consumables), mapRangeToArray(data.num_currencies)];

        const treasureTypeRow = (await pool.query(createTreasureTypeQuery, createTreasureTypeValues)).rows[0];

        return mapTreasureTypeRowToTreasureType(treasureTypeRow);
    }

    /* Updates a treasure type */
    public async updateTreasureType(id: number, data: UpdateTreasureType): Promise<TreasureType> {
        const updateTreasureTypeQuery = 'UPDATE treasure_type SET equipment_ids = $1, consumable_ids = $2, currency_ids = $3, num_equipment = $4, num_consumables = $5, num_currencies = $6 WHERE id = $7 RETURNING *';
        const updateTreasureTypeValues = [data.equipment_ids, data.consumable_ids, data.currency_ids, mapRangeToArray(data.num_equipment), mapRangeToArray(data.num_consumables), mapRangeToArray(data.num_currencies), id];

        const treasureTypeRow = (await pool.query(updateTreasureTypeQuery, updateTreasureTypeValues)).rows[0];

        return mapTreasureTypeRowToTreasureType(treasureTypeRow);
    }

    /* Gets a treasure type */
    public async getTreasureType(id: number): Promise<TreasureType | null> {
        const getTreasureTypeQuery = 'SELECT * FROM treasure_type WHERE id = $1';
        const getTreasureTypeValues = [id];

        const treasureTypeRow = (await pool.query(getTreasureTypeQuery, getTreasureTypeValues)).rows[0];

        return treasureTypeRow ? mapTreasureTypeRowToTreasureType(treasureTypeRow) : null;
    }

    /* Deletes a treasure type */
    public async deleteTreasureType(id: number): Promise<boolean> {
        const deleteTreasureTypeQuery = 'DELETE FROM treasure_type WHERE id = $1';
        const deleteTreasureTypeValues = [id];

        await pool.query(deleteTreasureTypeQuery, deleteTreasureTypeValues);

        return true;
    }

    /** Get treasure instance */
    public async getTreasure(id: number): Promise<Treasure> {
        const getTreasureQuery =
            'SELECT * FROM treasure AS t \
             LEFT JOIN treasure_type AS tt ON t.treasure_type_id = tt.id \
             WHERE t.id = $1';
        const getTreasureValues = [id];

        const treasureRow = (await pool.query(getTreasureQuery, getTreasureValues)).rows[0];

        return {
            id: treasureRow.id,
            interaction_type: EInteractionType.TREASURE,
            treasure_type: {
                id: treasureRow.treasure_type_id,
                equipment_ids: treasureRow.equipment_ids,
                consumable_ids: treasureRow.consumable_ids,
                currency_ids: treasureRow.currency_ids,
                num_equipment: mapArrayToRange(treasureRow.num_equipment),
                num_consumables: mapArrayToRange(treasureRow.num_consumables),
                num_currencies: mapArrayToRange(treasureRow.num_currencies)
            },
            opened: treasureRow.opened === 'true',
        }
    }

    /* Get treasure type ids */
    public async getTreasureTypeIds(): Promise<number[]> {
        const treasureIdRows = (await pool.query('SELECT id FROM treasure_type')).rows;
        const treasureIds = treasureIdRows.map((treasureId) => treasureId.id);
    
        return treasureIds;
    }

    /* Update treasure */
    public async updateTreasure(treasure: Treasure): Promise<Treasure> {
        const updateTreasureQuery = 'UPDATE treasure SET treasure_type_id = $1, opened = $2 WHERE id = $3 RETURNING *';
        const updateTreasureValues = [treasure.treasure_type.id, treasure.opened ? 'true' : 'false', treasure.id];

        const treasureRows = (await pool.query(updateTreasureQuery, updateTreasureValues)).rows;

        return treasure;
    }

    /*****************************
     * Creature Queries
     *****************************/

    /* Create a creature and all of its components */
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

    /* Get creatures */
    public async getCreatures(ids?: number[], type?: ECreatureType): Promise<Creature[]> {
        let getCreaturesQuery =
            'SELECT * FROM creatures AS c \
             LEFT JOIN inventories AS i ON c.inventory_id = i.id \
             LEFT JOIN creature_types AS ct ON c.creature_type_id = ct.id \
             LEFT JOIN ( \
                SELECT crp.id, crp.lvl, crp.xp, crp.hp, crp.abilities FROM creature_properties AS crp \
             ) cp ON c.creature_properties_id = cp.id';

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

            // TODO: These should be outside of the for loop to save db reads
            const [equipped, equipment, consumables, currencies] = await Promise.all([
                this.getEquipment(creatureRow.equipped),
                this.getEquipment(creatureRow.equipment_ids),
                this.getConsumables(creatureRow.consumable_ids),
                this.getCurrencies(creatureRow.currency_ids)
            ]);

            creature.equipped = equipped;
            creature.inventory.equipment = equipment;
            creature.inventory.consumables = consumables;
            creature.inventory.currencies = currencies;

            creatures.push(creature);
        }

        return creatures;
    }

    public async getCreature(id: number, type: ECreatureType): Promise<Creature> {
        return (await this.getCreatures([id], type))[0];
    }

    public async getCreatureIds(type: ECreatureType): Promise<number[]> {
        const getCreaturesQuery = 'SELECT id FROM creature WHERE creature_type = $1';
        const getCreaturesValues = [type];
        const creatureIdRows = (await pool.query(getCreaturesQuery, getCreaturesValues)).rows;
        const creatureIds = creatureIdRows.map((creature) => creature.id);

        return creatureIds;
    }
    

    public async getCreatureTypeIds(type: ECreatureType): Promise<number[]> {
        const getCreatureTypesQuery = 'SELECT id FROM creature_types WHERE c_type = $1';
        const getCreatureTypesValues = [type];
        const creatureTypeIdRows = (await pool.query(getCreatureTypesQuery, getCreatureTypesValues)).rows;
        const creatureTypeIds = creatureTypeIdRows.map((creatureType) => creatureType.id);

        return creatureTypeIds;
    }

    public async deleteCreature(id: number, type: ECreatureType): Promise<boolean> {
        const creatureRow = (await pool.query('SELECT * FROM creatures WHERE id = $1', [id])).rows[0];

        if (!creatureRow) {
            console.warn(`Could not update creature ${id} because it could not be found.`);
            return false;
        }

        if (creatureRow.creature_type !== type) {
            throw new BadRequestError({ message: `Could not delete creature ${id} because creature type ${creatureRow.creature_type} did not match ${type}` });
        }

        const result = await pool.query('DELETE FROM creatures WHERE id = $1', [id]);

        return true;
    }

    /**
     * This update does a full replace for a creature and all of its components.
     */
    public async updateCreature(id: number, creatureData: UpdateCreatureData): Promise<boolean> {
        const creatureRow = (await pool.query('SELECT * FROM creatures WHERE id = $1', [id])).rows[0];

        if (!creatureRow) {
            throw new BadRequestError({ message: `Could not update creature ${id} because it could not be found.` });
        }

        const connection = await pool.connect();
        try { 
            await connection.query('BEGIN');

            const equipped_ids: number[] = creatureData.equipped.map((equipment) => equipment?.id ?? null);

            const updateCreatureQuery = 'UPDATE creatures SET equipped_ids = $1, creature_name = $2, creature_type = $3, creature_properties_id = $4, creature_type_id = $5, inventory_id = $6 WHERE id = $7 RETURNING *';
            const updateCreatureValues = [equipped_ids, creatureData.creature_name, creatureData.creature_type, creatureData.properties.id, creatureData.type.id, creatureData.inventory.id, id];

            const updatedCreatureRow = (await pool.query(updateCreatureQuery, updateCreatureValues)).rows[0];

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
            throw new BadRequestError({ message: `Could not update creature properties ${creatureProperties.id} because it could not be found.` });
        }

        const updatePropertiesQuery = 'UPDATE creature_properties SET abilities = $1, lvl = $2, xp = $3, hp = $4 WHERE id = $5 RETURNING *';
        const updatePropertiesValues = [creatureProperties.abilities, creatureProperties.lvl, creatureProperties.xp, creatureProperties.hp, creatureProperties.id];

        const updatedPropertiesRow = (await pool.query(updatePropertiesQuery, updatePropertiesValues)).rows[0];

        return true;
    }

    public async updateCreatureType(creatureType: CreatureType): Promise<boolean> {
        let getTypeQuery = 'SELECT * FROM creature_types WHERE id = $1';
        const typeRow = (await pool.query(getTypeQuery, [creatureType.id])).rows[0];

        if (!typeRow) {
            throw new BadRequestError({ message: `Could not update creature type ${creatureType.id} because it could not be found.` });
        }

        const updateTypeQuery = 'UPDATE creature_types SET class = $1, race = $2, c_type = $3 WHERE id = $4 RETURNING *';
        const updateTypeValues = [creatureType.class, creatureType.race, creatureType.c_type, creatureType.id];

        const updatedTypeRow = (await pool.query(updateTypeQuery, updateTypeValues)).rows[0];

        return true;
    }

    /*****************************
     * Inventory Queries
     *****************************/

    public async updateInventory(inventoryData: Inventory): Promise<boolean> {
        let getInventoryQuery = 'SELECT * FROM inventories WHERE id = $1';
        const inventoryRow = (await pool.query(getInventoryQuery, [inventoryData.id])).rows[0];
        // TOOD: move check to service
        if (!inventoryRow) {
            throw new BadRequestError({ message: `Could not update creature inventory ${inventoryData.id} because it could not be found.` });
        }

        const equipment_ids: number[] = inventoryData.equipment.map((equipment) => equipment.id);
        const consumable_ids: number[] = inventoryData.consumables.map((consumable) => consumable.id);
        const currency_ids: number[] = inventoryData.currencies.map((currency) => currency.id);

        const updateInventoryQuery = 'UPDATE inventories SET equipment_ids = $1, consumable_ids = $2, currency_ids = $3, equipment_capacity = $4, consumables_capacity = $5 WHERE id = $6 RETURNING *';
        const updateInventoryValues = [equipment_ids, consumable_ids, currency_ids, inventoryData.equipment_capacity, inventoryData.consumables_capacity, inventoryData.id];

        const updatedInventoryRow = (await pool.query(updateInventoryQuery, updateInventoryValues)).rows[0];

        return true;
    }

    public async updateInventoryItems(inventoryId: number, type: EItemType, items: number[]): Promise<boolean> {
        
        let updateInventoryQuery = 'UPDATE inventories SET';
        let updateInventoryValues = [items, inventoryId];

        switch (type) {
            case EItemType.CONSUMABLE:
                updateInventoryQuery += ' consumable_ids = $1';
                break;
            case EItemType.CURRENCY:
                updateInventoryQuery += ' currency_ids = $1';
                break;
            case EItemType.EQUIPMENT:
                updateInventoryQuery += ' equipment_ids = $1';
                break;
        }

        updateInventoryQuery += ' WHERE id = $2 RETURNING *';

        const updatedInventoryRow = (await pool.query(updateInventoryQuery, updateInventoryValues)).rows[0];

        return true;
    }

    public async getEquipment(equipmentIds: number[]): Promise<Equipment[]> {
        if (!(equipmentIds?.length > 0)) {
            return [];
        }

        const equipmentRows = (await pool.query('SELECT * FROM equipment WHERE id = ANY ($1::int[])', [equipmentIds])).rows;

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

    /*****************************
     * Game Queries
     *****************************/

    public async createGameMap(runRows: number, numColumns: number, interactions: Map<number, Map<number, Interaction[]>>): Promise<GameMap> {
        const interactionsArray: number[] = [];
        mapInteractionsMapToInteractionsArray(interactions, interactionsArray);
        
        const createMapQuery = 'INSERT INTO game_map (num_rows, num_cols, interactions) VALUES ($1, $2, $3) RETURNING *';
        
        const gameMapRow = (await pool.query(createMapQuery, [runRows, numColumns, interactionsArray])).rows[0];

        return {
            id: gameMapRow.id,
            num_rows: gameMapRow.num_rows,
            num_cols: gameMapRow.num_cols,
            interactions
        };
    };

    public async createGame(gameMap: GameMap, party: Party, dm?: DungeonMaster): Promise<Game> {
        let createGameQuery = `INSERT INTO game (party_id, map_id${dm ? ', dm_id' : ''}) VALUES ($1, $2${dm ? ', $3' : ''}) RETURNING *`;
        const party_id = party.id;
        const createGameValues = [party_id, gameMap.id];

        if (dm) {
            createGameValues.push(dm.id);
        }

        const gameRow = (await pool.query(createGameQuery, createGameValues)).rows[0];

        return {
            id: gameRow.id,
            party,
            dm,
            map: gameMap,
            active: false
        };
    };
    
    public async updateGame(id: number, gameData: UpdateGameData): Promise<Game> {
        const updateGameQuery = 'UPDATE game SET party_id = $1, dm_id = $2, map_id = $3, combat_id = $4, active = $5 WHERE id = $6';
        const updateGameValues = [gameData.party.id, gameData.dm?.id, gameData.map.id, gameData.combat?.id, gameData.active ? 'true' : 'false', id];

        await pool.query(updateGameQuery, updateGameValues);

        return {
            id,
            ...gameData
        }
    }

    public getInteractions(interactions: number[]): Map<number, Map<number, Interaction[]>> {
        const interactionsMap = new Map<number, Map<number, Interaction[]>>();
        if (!interactions || interactions.length === 0) {
            return interactionsMap;
        }

        const length = EInteractionType.SIZE + 1;
        if ((interactions.length % length) !== 0) {
            throw new BadRequestError({ message: 'Could not parse interactions because array is the wrong format' });
        }

        mapInteractionsArrayToInteractionsMap(interactions, interactionsMap);

        return interactionsMap;
    }

    public async startGame(id: number): Promise<boolean> {
        const updateGameQuery = 'UPDATE game SET active = $1 WHERE id = $2 RETURNING *';
        const updateGameValues = ['true', id];

        const gameRow = (await pool.query(updateGameQuery, updateGameValues)).rows[0];

        return true;
    }
    
    public async getGame(id: number): Promise<Game> {
        const getGameQuery = `
            SELECT * FROM game as g
            LEFT JOIN party AS p ON g.party_id = p.id
            LEFT JOIN dungeon_master AS dm ON g.dm_id = dm.id
            LEFT JOIN game_map AS gm ON g.map_id = gm.id
            LEFT JOIN combat AS c ON g.combat_id = c.id
            WHERE g.id = ${id}
            `;
        const gameRow = (await pool.query(getGameQuery)).rows[0];
        
        if (!gameRow) {
            throw new BadRequestError({ message: 'Could get game because it does not exist' });
        }

        const players = await this.getPlayers(gameRow.player_ids);
        const interactions: Map<number, Map<number, Interaction[]>> = this.getInteractions(gameRow.interactions);

        const game: Game = {
            id,
            party: {
                id: gameRow.party_id,
                players,
                location: { row: gameRow.party_location[0], col: gameRow.party_location[1] }
            },
            map: {
                id: gameRow.map_id,
                num_rows: gameRow.num_rows,
                num_cols: gameRow.num_cols,
                interactions
            },
            active: gameRow.active === 'true'
        };

        if (gameRow.dm_id) {
            game.dm = {
                id: gameRow.dm_id,
                user_id: gameRow.user_id,
                user_name: gameRow.user_name
            };
        }

        return game;
    };

    /*****************************
     * Party/Players/DM Queries
     *****************************/

    public async createParty(players: Player[], location: Location): Promise<Party> {
        const createPartyQuery = 'INSERT INTO party (player_ids, party_location) VALUES ($1, $2) RETURNING *';
        const player_ids: number[] = players.map((player) => player.id) ?? [];

        const partyRow = (await pool.query(createPartyQuery, [player_ids, [location.col, location.row]])).rows[0];

        return {
            id: partyRow.id,
            players,
            location,
        };
    };

    public async getPlayers(ids: number[]): Promise<Player[]> {
        const playerRows = (await pool.query('SELECT * FROM player WHERE id = ANY ($1::int[])', [ids])).rows;

        const players: Player[] = [];
        const creature_ids: number[] = playerRows.filter((player) => player.character_id).map((player) => player.character_id);
        const creatures: Creature[] = await this.getCreatures(creature_ids);

        for(let i = 0; i < playerRows.length; ++i) {
            const playerRow = playerRows[i];
            const player: Player = {
                id: playerRow.id,
                user_id: playerRow.user_id,
                user_name: playerRow.user_name,
                character_id: playerRow.character_id
            };
            players.push(player);
        }

        return players;
    }

    public async createPlayer(userId: string, userName: string, characterId: number): Promise<Player> {
        const createPlayerQuery = `INSERT INTO player (user_id, user_name, character_id) VALUES ($1, $2, $3) RETURNING *`;
        const createPlayerValues = [userId, userName, characterId];

        const playerRow = (await pool.query(createPlayerQuery, createPlayerValues)).rows[0];

        return {
            id: playerRow.id,
            user_id: playerRow.user_id,
            user_name: playerRow.user_name,
            character_id: characterId,
        };
    };

    public async createDungeonMaster(userId: string, userName: string): Promise<DungeonMaster> {
        const createDungeonMasterQuery = 'INSERT INTO dungeon_master (user_id, user_name) VALUES ($1, $2) RETURNING *';
        const createDungeonMasterValues = [userId, userName];

        const dmRow = (await pool.query(createDungeonMasterQuery, createDungeonMasterValues)).rows[0];

        return {
            id: dmRow.id,
            user_id: dmRow.user_id,
            user_name: dmRow.user_name,
        };
    };

    public async getAvailablePartyList(): Promise<GameInfo[]> {
        const availableGamesQuery =
        'SELECT * FROM game AS g \
         LEFT JOIN party AS p ON g.party_id = p.id \
         WHERE g.active = $1 AND cardinality(p.player_ids) < 4';
        const availableGamesValues = ['false'];
        const gameRows = (await pool.query(availableGamesQuery, availableGamesValues)).rows;

        return gameRows.map((row) => {
            return {
                game_id: row.id,
                player_ids: row.player_ids,
                dm_id: row.dm_id
            }
        });
    }

    public async getAvailableDungeonMasterList(): Promise<GameInfo[]> {
        const availableGamesQuery = 'SELECT * FROM game WHERE active = $1 AND dm_id IS NULL';
        const availableGamesValues = ['false'];

        const gameRows = (await pool.query(availableGamesQuery, availableGamesValues)).rows;

        return gameRows.map((row) => {
            return {
                game_id: row.id,
                player_ids: row.player_ids,
                dm_id: row.dm_id
            }
        });
    }

    /*****************************
     * Party Queries
     *****************************/

    /* Get party */
    public async getPartyRow(id: number): Promise<PartyRow> {
        const getPartyQuery = 'SELECT * FROM party WHERE id = $1';
        const getPartyValues = [id];

        const partyRow = (await pool.query(getPartyQuery, getPartyValues)).rows[0];

        return partyRow;
    }

    /* Update party */
    public async updateParty(partyId: number, party: Party): Promise<Party> {
        const playerIds = party.players.map((player) => player.id);
        const partyLocation = [party.location.row, party.location.col];
        const updatePartyQuery = 'UPDATE party SET player_ids = $1, party_location = $2 WHERE id = $3 RETURNING *';
        const updatePartyValues = [playerIds, partyLocation, partyId];

        await pool.query(updatePartyQuery, updatePartyValues);

        return party;
    }

    /* Get the inventories for the characters from the list of players */
    public async getInventoryIds(playerIds: number[]): Promise<InventoryRow[]> {
        const getPlayersQuery =
        'SELECT * FROM player AS p \
         LEFT JOIN ( \
            SELECT c.id, c.inventory_id, i.equipment_capacity, i.consumables_capacity, i.equipment_ids, i.consumable_ids, i.currency_ids FROM creatures AS c \
            LEFT JOIN inventories AS i ON c.inventory_id = i.id \
         ) ci ON p.character_id = ci.id \
         WHERE p.id = ANY ($1::int[])';
        const getPlayersValues = [playerIds];

        const playerRows = (await pool.query(getPlayersQuery, getPlayersValues)).rows;

        return playerRows.map((player) => {
            return {
                id: player.inventory_id,
                equipment_capacity: player.equipment_capacity,
                consumables_capacity: player.consumables_capacity,
                equipment_ids: player.equipment_ids,
                consumable_ids: player.consumable_ids,
                currency_ids: player.currency_ids,
            }
        });
    }

    /*****************************
     * Combat Queries
     *****************************/

    /* Create combatant */
    public async createCombatant(creature: Creature, type: ECombatantType): Promise<Combatant> {
        const createCombatantQuery = 'INSERT INTO combatant (creature_id, combatant_type) VALUES ($1, $2) RETURNING *';
        const createCombatantValues = [creature.id, type];

        const combatantRow = (await pool.query(createCombatantQuery, createCombatantValues)).rows[0];

        return {
            id: combatantRow.id,
            creature,
            combatantType: type
        };
    }

    /* Get combatants */
    public async getCombatants(combatantIds: number[]): Promise<Combatant[]> {
        const getCombatantsQuery = 'SELECT * FROM combatant WHERE id = ANY ($1::int[])';
        const getCombatantsValues = [combatantIds];

        const combatantRows = (await pool.query(getCombatantsQuery, getCombatantsValues)).rows;

        const creatureIds = combatantRows.map((combatant) => combatant.creature_id);
        const creatures: Creature[] = await this.getCreatures(creatureIds);
        const creaturesMap: Map<number, Creature> = new Map(creatures.map(creature => [creature.id, creature]));

        const combatants: Combatant[] = [];
        for (let i = 0; i < combatantRows.length; ++i) {
            const combatantRow = combatantRows[i];
            const creature: Creature = creaturesMap.get(combatantRow.creature_id) as Creature;
            combatants.push({
                id: combatantRow.id,
                creature,
                combatantType:combatantRow.combatant_type
            })
        }

        return combatants;
    }

    /* Create combat */
    public async createCombat(combatants: Combatant[]): Promise<Combat> {
        const combatantIds = combatants.map((combatant) => combatant.id);
        const createCombatQuery = 'INSERT INTO combat (combatant_ids) VALUES ($1) RETURNING *';
        const createCombatValues = [combatantIds];

        const combatRow = (await pool.query(createCombatQuery, createCombatValues)).rows[0];

        return {
            id: combatRow.id,
            combatantTurnIndex: combatRow.combatant_turn_index,
            combatants,
            faintedMonsterIds: combatRow.fainted_monster_ids,
            faintedCharacterIds: combatRow.fainted_character_ids
        };
    }

    /* Get combat */
    public async getCombat(id: number): Promise<Combat> {
        const getCombatQuery = 'SELECT * FROM combat WHERE id = $1';
        const getCombatValues = [id];

        const combatRow = (await pool.query(getCombatQuery, getCombatValues)).rows[0];

        if (!combatRow) {
            throw new BadRequestError({ message: 'Could not get combat because specified value does not exist.' });
        }

        const combatants = await this.getCombatants(combatRow.combatant_ids);

        return {
            id: combatRow.id,
            combatantTurnIndex: combatRow.combatant_turn_index,
            combatants,
            faintedMonsterIds: combatRow.fainted_monster_ids,
            faintedCharacterIds: combatRow.fainted_character_ids
        };
    }

    /* Update combat */
    public async updateCombat(combat: Combat): Promise<Combat> {
        const combatantIds = combat.combatants.map((combatant) => combatant.id);
        const updateCombatQuery = 'UPDATE combat SET combatant_ids = $1, combatant_turn_index = $2, fainted_monster_ids = $3, fainted_character_ids = $4 WHERE id = $5 RETURNING *';
        const updateCombatValues = [combatantIds, combat.combatantTurnIndex, combat.faintedMonsterIds, combat.faintedMonsterIds, combat.id];

        await pool.query(updateCombatQuery, updateCombatValues);

        return combat;
    }

    /* Delete combat */
    public async deleteCombat(gameId: number, combatId: number): Promise<boolean> {
        const deleteCombatQuery = 'DELETE FROM combat WHERE id = $1';
        const deleteCombatValues = [combatId];
    
        await pool.query(deleteCombatQuery, deleteCombatValues);

        const updateGameQuery = 'UPDATE game SET combat_id = $1 WHERE id = $2';
        const updateGameValues = [null, gameId];
    
        await pool.query(updateGameQuery, updateGameValues);

        return true;
    }
}

export default UserRepository;
