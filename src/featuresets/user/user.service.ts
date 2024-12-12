import { lookup } from "dns";
import { cp } from "fs";
import pool from "../../db";
import { BadRequestError } from "../../middleware/errors";
import UserRepository from "./user.repository";
import { Combat, Combatant, CreateCreatureData, CreateCreatureResults, CreateGameData, CreateTreasureType, Creature, CreatureType, EAbilities, EClass, ECombatantType, ECreatureType, EDirection, EInteractionType, EItemType, ERace, Game, GameInfo, GameMap, GetCreatureRow, Interaction, Inventory, InventoryRow, Location, MAX_MONSTERS_ON_MAP, MAX_PLAYERS, MAX_TREASURES_ON_MAP, Party, Player, Range, Treasure, TreasureType, UpdateCreatureData, UpdateGameData, UpdateTreasureType } from "./user.schema";

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
            throw new BadRequestError({ message: 'Could not create monster because type was not of monster' });
        }

        return this.createCreature(monsterDetails);
    }

    public async createCharacter(characterData: CreateCreatureData): Promise<Creature> {
        if (characterData.type !== ECreatureType.CHARACTER) {
            throw new BadRequestError({ message: 'Could not create character because type was not of character' });
        }

        return this.createCreature(characterData);
    }

    public async createCreature(creatureDetails: CreateCreatureData): Promise<Creature> {
        const creatureResults: CreateCreatureResults = await this._userRepository.createCreature(creatureDetails);

        return this.mapCreatureResultsToCreature(creatureResults);
    }

    public async updateCreature(creatureId: number, creatureData: UpdateCreatureData): Promise<boolean> {
        if (!creatureData.properties?.id) {
            throw new BadRequestError({ message: `Could not update creature ${creatureId} because properties is missing` });
        } else if (!creatureData.type?.id) {
            throw new BadRequestError({ message: `Could not update creature ${creatureId} because type is missing` });
        } else if (!creatureData.inventory?.id) {
            throw new BadRequestError({ message: `Could not update creature ${creatureId} because inventory is missing` });
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
        const creatures: Creature[] = await this._userRepository.getCreatures(ids, type);

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

    private setTileInteraction(row: number, col: number, interaction: Interaction, interactions: Map<number, Map<number, Interaction[]>>): void {
        let interactionsRow = interactions.get(row);
        if (!interactionsRow) {
            interactionsRow = new Map<number, Interaction[]>();
            interactions.set(row, interactionsRow);
        }

        let tileInteractions: Interaction[] | undefined = interactionsRow.get(col);
        if (!tileInteractions) {
            tileInteractions = [];
        }
        tileInteractions.push(interaction);
        interactionsRow.set(col, tileInteractions);
        interactions.set(row, interactionsRow);
    }

    public async createGame(gameData: CreateGameData): Promise<Game> {
        // TODO: use a transaction to avoid partial game creations on error
        const partyLocation: Location = { row: 0, col: 0 }; // temp until replaced with real map data
        const interactions: Map<number, Map<number, Interaction[]>> = new Map<number, Map<number, Interaction[]>>();
        const players: Player[] = [];

        const treasureTypes = await this._userRepository.getTreasureTypeIds();

        if (treasureTypes.length === 0) {
            throw new BadRequestError({ message: 'Cannot create game because no treasure types have been generated' });
        } else if (gameData.map.min_monsters < 1 || gameData.map.min_monsters > gameData.map.max_monsters || gameData.map.max_monsters < 1 || gameData.map.max_monsters > MAX_MONSTERS_ON_MAP || gameData.map.min_monsters > MAX_MONSTERS_ON_MAP) {
            throw new BadRequestError({ message: 'Cannot create game because monster count is out of range' });
        } else if (gameData.map.min_treasures < 1 || gameData.map.min_treasures > gameData.map.max_treasures || gameData.map.max_treasures < 1 || gameData.map.max_treasures > MAX_TREASURES_ON_MAP || gameData.map.min_treasures > MAX_TREASURES_ON_MAP) {
            throw new BadRequestError({ message: 'Cannot create game because treasure count is out of range' });
        }

        const numMonstersToAdd = this.pickIntegerFromRange({ min: gameData.map.min_monsters, max: gameData.map.max_monsters });
        const numTreasuresToAdd = this.pickIntegerFromRange({ min: gameData.map.min_treasures, max: gameData.map.max_treasures });

        // For simplicity, assume that monsters and treasures can be placed anywhere on the map
        
        // Add random monsters to map
        for (let i = 0; i < numMonstersToAdd; ++i) {
            // TODO: add more randomness to this generation
            const creatureData: CreateCreatureData = {
                name: `Enemy Creature ${i + 1}`,
                hp: this.pickIntegerFromRange({ min: 50, max: 200 }),
                abilities: [8, 10, 15, 6, 20, 9],
                class: EClass.FIGHTER,
                race: ERace.DWARF,
                type: ECreatureType.MONSTER,
                equipment_capacity: 10,
                consumables_capacity: 10
            }

            const monster = await this._userRepository.createCreature(creatureData);

            const row = this.pickIntegerFromRange({ min: 0, max: gameData.map.num_rows - 1 });
            const col = this.pickIntegerFromRange({ min: 0, max: gameData.map.num_cols - 1 });
            const interaction: Interaction = {
                id: monster.creature.id,
                interaction_type: EInteractionType.MONSTER
            };

            this.setTileInteraction(row, col, interaction, interactions);
            console.log(`Adding monster ${JSON.stringify(monster)} to row ${row} and col ${col} of interactions map`);
        }

        // Add random treasures to map
        for (let i = 0; i < numTreasuresToAdd; ++i) {
            const treasureTypeIndex =  this.pickIntegerFromRange({ min: 0, max: treasureTypes.length - 1 });

            const treasureId = await this._userRepository.createTreasure(treasureTypes[treasureTypeIndex]);

            const row = this.pickIntegerFromRange({ min: 0, max: gameData.map.num_rows - 1 });
            const col = this.pickIntegerFromRange({ min: 0, max: gameData.map.num_cols - 1 });
            const interaction: Interaction = {
                id: treasureId,
                interaction_type: EInteractionType.TREASURE
            };

            this.setTileInteraction(row, col, interaction, interactions);
            console.log(`Adding treasure ${treasureId} to row ${row} and col ${col} of interactions map`);
        }

        // Create player if provided
        if (gameData.player) {
            const player = await this._userRepository.createPlayer(gameData.player.user_id, gameData.player.user_name, gameData.player.character_id);
            players.push(player);
        }

        // Create dungeon master if provided
        let dm;
        if (gameData.dm?.user_id) {
            dm = await this._userRepository.createDungeonMaster(gameData.dm.user_id, gameData.dm.user_name);
        }

        // Create party
        let party: Party = await this._userRepository.createParty(players, partyLocation);

        // Create game map
        const gameMap: GameMap = await this._userRepository.createGameMap(gameData.map.num_rows, gameData.map.num_cols, interactions);

        // Create game instance
        const game: Game = await this._userRepository.createGame(gameMap, party, dm);

        return game;
    }

    public async updateGame(id: number, gameData: UpdateGameData): Promise<Game> {
        // TODO: reference updateCreature
        if (!gameData.party) {
            throw new BadRequestError({ message: `Could not update game ${id} because party is missing` });
        } else if (!gameData.map) {
            throw new BadRequestError({ message: `Could not update game ${id} because map is missing` });
        }

        const game: Game = await this._userRepository.updateGame(id, gameData);

        return game;
    }

    public async getGame(id: number): Promise<Game> {
        const game: Game = await this._userRepository.getGame(id);

        return game;
    }

    public async startGame(id: number): Promise<boolean> {
        const game: Game = (await this._userRepository.getGame(id));

        if (!game) {
            throw new BadRequestError({ message: 'Could not start game because game does not exist.' });
        }

        if (!game.dm) {
            throw new BadRequestError({ message: 'Could not start game because there is no dm.' });
        }

        if (!game.party?.players || game.party.players.length === 0) {
            throw new BadRequestError({ message: 'Could not start game because there are no players.' });
        }

        if (game.active) {
            // Game is already started
            return true;
        }

        const isStarted = await this._userRepository.startGame(id);

        return isStarted;
    }

    
    /**
     * This is a naive implementation of getting a list of available games.
     * For a large player base the games would likely be paritioned by
     * region and geolocation, and would be paginated.
     */
    public async getAvailablePartyList(): Promise<GameInfo[]> {
        const gameRows = await this._userRepository.getAvailablePartyList();

        return gameRows;
    }

    public async getAvailableDungeonMasterList(): Promise<GameInfo[]> {
        const gameRows = await this._userRepository.getAvailableDungeonMasterList();

        return gameRows;
    }

    public async createTreasure(data: CreateTreasureType): Promise<TreasureType> {
        const treasureType = await this._userRepository.createTreasureType(data);

        return treasureType;
    }

    public async updateTreasure(id: number, data: UpdateTreasureType): Promise<TreasureType> {
        const existingTreasureType = await this._userRepository.getTreasureType(id);
        if (!existingTreasureType) {
            throw new BadRequestError({ message: 'Could not update treasure because treasure was not found.'});
        }
        
        const treasureType = await this._userRepository.updateTreasureType(id, data);

        return treasureType;
    }

    public async getTreasure(id: number): Promise<TreasureType> {
        const treasureType = await this._userRepository.getTreasureType(id);

        if (!treasureType) {
            throw new BadRequestError({ message: 'No treasure by that id was found.'});
        }

        return treasureType;
    }

    public async deleteTreasure(id: number): Promise<boolean> {
        const existingTreasureType = await this._userRepository.getTreasureType(id);
        if (!existingTreasureType) {
            // Treasure doesn't exist so nothing to delete
            return true;
        }
        
        await this._userRepository.deleteTreasureType(id);

        return true;
    }

    private pickIntegerFromRange(range: Range): number {
        const randomAmount = range.min + Math.floor(Math.random() * (range.max - range.min + 1));

        return randomAmount;
    }

    /* Pick loot from the available choices. Results may include duplicates. */
    private getLoot(range: Range, ids: number[]): number[] {
        if (!range || !ids || ids.length === 0) {
            return [];
        }
        
        const lootAmount = this.pickIntegerFromRange(range);
        const loot: number[] = [];
        const numLootTypes = ids.length;
   
        for (let i = 0; i < lootAmount; ++i) {
            const id = ids[Math.floor(Math.random() * numLootTypes)];
            loot.push(id);
        }

        return loot;
    }

    /**
     * Open up a treasure.
     *
     * For simplicty we will generate loot and assign it to the active players in one step.
     * In the future it would be better to seperate these tasks and let the players and dm decide who gets what loot.
     * It would also be better to give loot to another player if the selected players inventory is full.
     */
    public async openTreasureInstance(partyId: number, treasureId: number): Promise<void> {
        const existingTreasure = await this._userRepository.getTreasure(treasureId);

        if (!existingTreasure) {
            throw new BadRequestError({ message: 'Could not open treasure because it does not exist.' });
        } else if (existingTreasure.opened) {
            throw new BadRequestError({ message: 'Could not open treasure because it was already opened.' });
        }

        const playerIds = (await this._userRepository.getPartyRow(partyId)).player_ids;
        const inventoryRows: InventoryRow[] = (await this._userRepository.getInventoryIds(playerIds));

        if (!playerIds || playerIds.length === 0) {
            throw new BadRequestError({ message: 'Could not open treasure because there are no players in the party.' });
        }

        const treasureType: TreasureType = existingTreasure.treasure_type;
        const consumableIds = this.getLoot(treasureType.num_consumables,treasureType.consumable_ids);
        const equipmentIds = this.getLoot(treasureType.num_equipment, treasureType.equipment_ids);
        const currencyIds = this.getLoot(treasureType.num_currencies, treasureType.currency_ids);
        const range = { min: 0, max: inventoryRows.length - 1};

        // Dole out Consumables players in party
        for (let i = 0; i < consumableIds.length; ++i) {
            const consumable = consumableIds[i];
            const randomIndex = this.pickIntegerFromRange(range);
            const inventoryRow = inventoryRows[randomIndex];

            // Make sure consumables inventory has room
            if (inventoryRow.consumables_capacity > inventoryRow.consumable_ids.length) {
                inventoryRow.consumable_ids.push(consumable);
                await this._userRepository.updateInventoryItems(inventoryRow.id, EItemType.CONSUMABLE, inventoryRow.consumable_ids);
            }
        }

        // Dole out Equipment players in party
        for (let i = 0; i < equipmentIds.length; ++i) {
            const equipment = equipmentIds[i];
            const randomIndex = this.pickIntegerFromRange(range);
            const inventoryRow = inventoryRows[randomIndex];

            // Make sure equipment inventory has room
            if (inventoryRow.equipment_capacity > inventoryRow.equipment_ids.length) {
                inventoryRow.equipment_ids.push(equipment);
                await this._userRepository.updateInventoryItems(inventoryRow.id, EItemType.EQUIPMENT, inventoryRow.equipment_ids);
            }
        }

        // Dole out Currencies to players in party
        for (let i = 0; i < currencyIds.length; ++i) {
            const currency = currencyIds[i];
            const randomIndex = this.pickIntegerFromRange(range);
            const inventoryRow = inventoryRows[randomIndex];

            inventoryRow.currency_ids.push(currency);
            await this._userRepository.updateInventoryItems(inventoryRow.id, EItemType.CURRENCY, inventoryRow.currency_ids);
        }
    }

    public async joinGameAsDungeonMaster(gameId: number, userId: string, userName: string): Promise<boolean> {
        if (!gameId) {
            throw new BadRequestError({ message: 'Could join game as dm because no game id supplied.' });
        } else if (!userId) {
            throw new BadRequestError({ message: 'Could join game as dm because no user id supplied.' });
        }

        const game = await this._userRepository.getGame(gameId);

        if (game.dm) {
            if (game.dm.user_id === userId) {
                // User has already joined the game as dm
                return true;
            } else {
                throw new BadRequestError({ message: 'Could join game because game already has an active dm.' });
            }
        }

        // TODO: throw error if user has already joined as a player

        const dm = await this._userRepository.createDungeonMaster(userId, userName);

        game.dm = dm;

        await this._userRepository.updateGame(game.id, game);

        return true;
    }

    public async joinGameAsPlayer(gameId: number, userId: string, userName: string, characterId: number): Promise<boolean> {
        if (!gameId) {
            throw new BadRequestError({ message: 'Could join game as player because no game id supplied.' });
        } else if (!userId) {
            throw new BadRequestError({ message: 'Could join game as player because no user id supplied.' });
        }

        const game = await this._userRepository.getGame(gameId);
        const players = game.party.players;
        const numPlayers = players.length;

        if (numPlayers > 0) {
            for (let i = 0; i < numPlayers; ++i) {
                if (players[i].user_id === userId) {
                    // User already joined the game as a player
                    return true;
                }
            }

            if (numPlayers >= MAX_PLAYERS) {
                throw new BadRequestError({ message: 'Could join game as player because the game is full.' });
            }
        }

        // TODO: throw error if user has already joined as a dm

        const player = await this._userRepository.createPlayer(userId, userName, characterId);

        game.party.players.push(player);

        await this._userRepository.updateGame(game.id, game);

        return true;
    }

    public async beginCombat(gameId: number, location: Location): Promise<Combat> {
        const game: Game = await this._userRepository.getGame(gameId);

        const map: GameMap = game.map;

        const monsterIds: number[] = [];
        const characterIds: number[] = game.party.players.map((player) => player.character_id);
        const combatants: Combatant[] = [];
        
        const interactions: Interaction[] | undefined = map.interactions.get(location.row)?.get(location.col);
        if (interactions) {
            for (let i = 0; i < interactions.length; ++i) {
                const interaction = interactions[i];
                
                if (interaction.interaction_type === EInteractionType.MONSTER) {
                    monsterIds.push(interaction.id);
                }
            }
        }

        const creatures: Creature[] = await this.getCreatures([...monsterIds, ...characterIds]);
        
        // Create combatants
        for(let i = 0; i < creatures.length; ++i) {
            const creature = creatures[i];
            const combatant: Combatant = await this._userRepository.createCombatant(creature, creature.creature_type === ECreatureType.MONSTER ? ECombatantType.MONSTER : ECombatantType.PLAYER);

            combatants.push(combatant);
        }

        // Sort combatants by speed for attack ordering
        combatants.sort((a: Combatant, b: Combatant) => a.creature.properties.abilities[EAbilities.DEXTERITY] - b.creature.properties.abilities[EAbilities.DEXTERITY]);

        const combat: Combat = await this._userRepository.createCombat(combatants);

        return combat;
    }

    /* Very basic tile-based movement. Only allow the party to move 1 tile at a time. */
    public async moveParty(gameId: number, playerId: number, direction: EDirection): Promise<Location> {
        if (!gameId) {
            throw new BadRequestError({ message: 'Could not move player because no game id supplied.' });
        } else if (!playerId) {
            throw new BadRequestError({ message: 'Could not move player because no player id supplied.' });
        } else if (!direction) {
            throw new BadRequestError({ message: 'Could not move player because no direction supplied.' });
        }

        // TODO: throw if game state doesn't allow for movement (such as during combat)

        const game: Game = await this._userRepository.getGame(gameId);
        const party: Party = game.party;
        const players: Player[] = party.players;

        if (!players || players.length === 0) {
            throw new BadRequestError({ message: 'Could not move party because there are no players in the party.' });
        } else if (!players.map((player) => player.id).includes(playerId)) {
            throw new BadRequestError({ message: 'Could not move party because this player is not in the party.' });
        }

        const map: GameMap = game.map;
        const partyLocation: Location = party.location;

        // Update party location
        // TODO: Make sure party can move in the specified direction by checking map boundries and checking for walkable areas
        switch(direction) {
            case EDirection.NORTH:
                partyLocation.row = partyLocation.row - 1;
                break;
            case EDirection.EAST:
                partyLocation.col = partyLocation.col + 1;
                break;
            case EDirection.SOUTH:
                partyLocation.row = partyLocation.row - 1;
                break;
            case EDirection.WEST:
                partyLocation.col = partyLocation.col - 1;
                break;
        }

        await this._userRepository.updateParty(party.id, party);

        return partyLocation;
    }

    private async onCombatWin(gameId: number, combat: Combat): Promise<void> {
        // TODO: Loot monsters

        // TODO: Apply XP to characters

        // TODO: Check for level ups

        // Cleanup combat state
        await this._userRepository.deleteCombat(gameId, combat.id);
    }

    private async onCombatLoss(gameId: number, combat: Combat): Promise<void> {
        // TODO: Teleport team to healing area

        // Cleanup combat state
        await this._userRepository.deleteCombat(gameId, combat.id);
    }

    /**
     * Take combat turn. Combatants must attack in order.
     * 
     * Currently only supports attacking. In the future this should support other options such as
     * spells, items, special abilities, retreating, and targeting multiple combatants.
     */
    public async takeCombatTurnForCombatant(gameId: number, combatId: number, attackerCombatantId: number, defenderCombatantId: number): Promise<void> {
        
        const combat: Combat = await this._userRepository.getCombat(combatId);
        const attacker: Combatant = combat.combatants[combat.combatantTurnIndex];
        if (!attacker) {
            throw new BadRequestError({ message: 'Could not take combat turn because attacker does not exist in combat'});
        } else if (attacker.id !== attackerCombatantId) {
            throw new BadRequestError({ message: 'Could not take combat turn because it is not this attackers turn yet'});
        }

        const defender: Combatant | undefined = combat.combatants.find((combatant) => combatant.id === defenderCombatantId);

        if (!defender) {
            throw new BadRequestError({ message: 'Could not take combat turn because defender does not exist in combat'});
        } else if (attacker.combatantType === defender.combatantType) {
            throw new BadRequestError({ message: 'Could not take combat turn because attacked and defender our on the same team'});
        }

        // Roll for hit and damage
        const rolledD20 = this.pickIntegerFromRange({ min: 1, max: 20 });
        const attackPower = rolledD20 + attacker.creature.properties.abilities[EAbilities.STRENGTH];
        const defendPower = defender.creature.properties.abilities[EAbilities.DEXTERITY]; // We don't have AC so using dexterity for now

        if (attackPower > defendPower) {
            // Attack hits
            defender.creature.properties.hp = Math.max(defender.creature.properties.hp - (attackPower - defendPower), 0);

            // Persist damage done to defender
            await this._userRepository.updateCreatureProperties(defender.creature.properties);

            if (defender.creature.properties.hp === 0) {
                // Defender has fainted so remove them from combatants to the fainted array
                if (defender.creature.creature_type === ECreatureType.MONSTER) {
                    combat.faintedMonsterIds.push(defender.creature.id);
                }
                if (defender.creature.creature_type === ECreatureType.CHARACTER) {
                    combat.faintedCharacterIds.push(defender.creature.id);
                }
                combat.combatants.filter((combatant) => combatant.id !== defender.id);

                if(combat.combatants.filter((combatant) => combatant.combatantType !== defender.combatantType).length === 0) {
                    // Defenders have all fainted
                    if (defender.combatantType === ECombatantType.MONSTER) {
                        // Players won
                        await this.onCombatWin(gameId, combat);
                    } else if (defender.combatantType === ECombatantType.PLAYER) {
                        // Monsters won
                        await this.onCombatLoss(gameId, combat);
                    }
                }
            }
        }
    }
}

export default UserService;
