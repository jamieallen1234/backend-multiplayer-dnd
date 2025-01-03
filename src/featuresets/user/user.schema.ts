import { BadRequestError } from "../../middleware/errors";

export const MAX_PLAYERS = 4;
export const MAX_MONSTERS_ON_MAP = 500;
export const MAX_TREASURES_ON_MAP = 200;

/**
 * Must be in order or abilities table rows
 */
export enum EAbilities {
    STRENGTH = 0,
    DEXTERITY = 1,
    CONSTITUTION = 2,
    INTELLIGENCE = 3,
    WISDOM = 4,
    CHARISMA = 5,
    SIZE = 6 // must be last
};

export enum EClass {
    FIGHTER = 'fighter',
    MONK = 'monk',
    ROGUE = 'rogue',
    RANGER = 'ranger',
    WIZARD = 'wizard'
};

export enum ERace {
    DWARF = 'dwarf',
    ELF = 'elf',
    HUMAN = 'human',
    ORC = 'orc'
};

export enum EItemType {
    CURRENCY = 'currency',
    EQUIPMENT = 'equipment',
    CONSUMABLE = 'consumable'
};

export enum ECreatureType {
    CHARACTER = 'character',
    MONSTER = 'monster',
    NPC = 'npc'
};

export enum EInteractionType {
    MONSTER = 0,
    NPC = 1,
    TREASURE = 2,
    SIZE = 3 // must be last
};

export enum ECombatantType {
    CHARACTER = 'character',
    MONSTER = 'monster'
};

export enum EConsumable {
    POTION = 'potion',
    REVIVE = 'revive'
}

export enum EEquipment {
    HEAD = 0,
    TORSO = 1,
    LEGS = 2,
    HANDS = 3,
    FEET = 4,
    RING = 5,
    NECKLACE = 6,
    SIZE = 7 // must be last
};

export enum ECurrency {
    GOLD = 0,
    SILVER = 1,
    SIZE = 2 // must be last
}

export enum EDirection {
    NORTH = 'north',
    EAST = 'east',
    SOUTH = 'south',
    WEST = 'west'
}

export type Location = {
    row: number,
    col: number,
}

export type Interaction = {
    id: number,
    interaction_type?: EInteractionType,
}

/* An instance of a creature, which includes characters, monsters and npc's */
export type Creature = Interaction & {
    creature_name: string,
    creature_type: ECreatureType,
    properties: CreatureProperties,
    type: CreatureType,
    inventory: Inventory,
    equipped: Equipment[], // Use EEquipment to index into array to get desiried ability

};

/* Creature properties are any properties on a creature that get modified by leveling up */
export type CreatureProperties = {
    id: number,
    lvl: number,
    xp: number,
    hp: number,
    abilities: number[] // Use EAbilities to index into array to get desiried ability
};

/* Attributes that define a unique type of creature, including class, race and type */
export type CreatureType = {
    id: number,
    class: EClass,
    race: ERace,
    c_type: ECreatureType
};

export type Item = {
    id: number
};

/* Equipment equipable by creatures */
export type Equipment = Item & {
    name: string,
    type: EEquipment,
    ability_modifiers: number[]
};

/* Currencies for transactions (buying and selling) */
export type Currency = Item & {
    type: ECurrency,
    total: number,
};

/** Items consumable by creatures */
export type Consumable = Item & {
    name: string,
    type: EConsumable,
    /* special properties */
};

export type Inventory = {
    id: number,
    equipment_capacity: number,
    consumables_capacity: number,
    equipment: Equipment[];
    consumables: Consumable[],
    currencies: Currency[] // use ECurrency to index into array to get desired currency 
};

export type InventoryRow = {
    id: number,
    equipment_capacity: number,
    consumables_capacity: number,
    equipment_ids: number[];
    consumable_ids: number[],
    currency_ids: number[]
};

export type Player = {
    id: number,
    user_id: string,
    user_name: string,
    character_id: number
    // character?: Creature
};

export type Party = {
    id: number,
    players: Player[],
    location: Location,
};

export type PartyRow = {
    id: number,
    player_ids: number[],
    location_id: number,
    created_at: string,
    updated_at: string
}

export type DungeonMaster = {
    id: number,
    user_id: string,
    user_name: string,
};

/**
 * The game instance. State is handled by the Game and the GameMap.
 */
export type Game = {
    id: number,
    party: Party,
    dm?: DungeonMaster,
    map: GameMap,
    combat?: Combat
    active: boolean
};

/**
 * The map of the game instance. For simplicity we will make it a rectangular grid
 * and have only a single map.
 */
export type GameMap = {
    id: number,
    num_rows: number,
    num_cols: number,
    interactions: Map<number, Map<number, Interaction[]>> /* row, col */
    // playerLocation: Location, 
};

/* Range is inclusive */
export type Range = {
    min: number,
    max: number
}

export type TreasureType = {
    id: number,
    equipment_ids: number[],
    consumable_ids: number[],
    currency_ids: number[],
    num_equipment: Range,
    num_consumables: Range,
    num_currencies: Range
}

export type TreasureTypeRow = {
    id: number,
    equipment_ids: number[],
    consumable_ids: number[],
    currency_ids: number[],
    num_equipment: number[],
    num_consumables: number[],
    num_currencies: number[],
    created_at: number,
    updated_at: number
}

/**
 * Loot boxes. Can be found by exploring the game map or from special interactions.
 */
export type Treasure = Interaction & {
    treasure_type: TreasureType,
    opened: boolean,
};

export type Combat = {
    id: number,
    combatantTurnIndex: number,
    combatants: Combatant[], // array should be in order of combat
    faintedMonsterIds: number[],
    faintedCharacterIds: number[]
};

export type Combatant = {
    id: number,
    creature: Creature,
    combatantType: ECombatantType
}

export type CreateCreatureData = {
    name: string,
    hp: number,
    abilities: number[],
    class: EClass,
    race: ERace,
    type: ECreatureType,
    equipment_capacity: number,
    consumables_capacity: number,
};

export type CreateCreatureResults = {
    abilities: number[],
    properties: CreatureProperties,
    type: CreatureType,
    inventory: Inventory,
    creature: Creature,
    equipped: Equipment[]
};

export type GetCreatureResults = {
    abilities: number[],
    properties: CreatureProperties,
    type: CreatureType,
    inventory: Inventory,
    creature: Creature,
    equipped: Equipment[]
};

export type GetCreatureRow = {
    id: number,
    creature_name: string,
    creature_type: ECreatureType,
    creature_properties_id: number,
    lvl: number,
    xp: number,
    hp: number,
    abilities: number[],
    creature_type_id: number,
    class: EClass,
    race: ERace,
    inventory_id: number,
    equipment_capacity: number,
    consumables_capacity: number,
    equipped: number[],
    equipment_ids: number[],
    consumable_ids: number[],
    currency_ids: number[]
};

export type CreateGameData = {
    player?: {
        user_id: string, // set if creator is joining the game as a player
        user_name: string,
        character_id: number, // user must have a character to play the game
    },
    dm?: {
        user_id: string, // set if the creator is joining the game as a dungeon master
        user_name: string
    },
    map: {
        num_rows: number,
        num_cols: number,
        min_monsters: number,
        max_monsters: number,
        min_treasures: number,
        max_treasures: number
    }
    /* Interactions will be randomly generated as per task description */
};

export type GameInfo = {
    game_id: number,
    player_ids: number[];
    dm_id: number
}

export type CreateTreasureType = Omit<TreasureType, 'id'>;
export type UpdateTreasureType = Omit<TreasureType, 'id'>;
export type UpdateCreatureData = Omit<Creature, 'id'>;
export type UpdateGameData = Omit<Game, 'id'>;
export type IteractionData = { row: number, col: number, id: number, interaction_type: EInteractionType };

export function mapRangeToArray(range: Range): number[] {
    return [range.min, range.max];
}

export function mapArrayToRange(data: number[]): Range {
    if (!data || data.length !== 2) {
        throw new BadRequestError({ message: 'Cannot map array to range' });
    }

    return { min: data[0], max: data[1]};
}

export function mapTreasureTypeRowToTreasureType(row: TreasureTypeRow): TreasureType {
    return {
        id: row.id,
        equipment_ids: row.equipment_ids,
        consumable_ids: row.consumable_ids,
        currency_ids: row.currency_ids,
        num_equipment: mapArrayToRange(row.num_equipment),
        num_consumables: mapArrayToRange(row.num_consumables),
        num_currencies: mapArrayToRange(row.num_currencies)
    };
};

export function mapInteractionsArrayToInteractionsMap(interactions: number[], interactionsMap: Map<number, Map<number, Interaction[]>>): void {
    for (let i = 0; i <= EInteractionType.SIZE + 1; ++i) {
        const data: IteractionData = {row: interactions[i], col: interactions[i + 1], id: interactions[i + 2], interaction_type: interactions[i + 3]};
        
        let columns = interactionsMap.get(data.row);
        if (!columns) {
            columns = new Map<number, Interaction[]>();
            interactionsMap.set(data.row, columns);
        }

        let tileInteractions: Interaction[] | undefined = columns.get(data.col);
        if(!tileInteractions) {
            tileInteractions = [];
            columns.set(data.col, tileInteractions);
        }

        tileInteractions.push({
            id: data.id,
            interaction_type: data.interaction_type
        });
    }
}

export function mapInteractionsMapToInteractionsArray(interactionsMap: Map<number, Map<number, Interaction[]>>, interactions: number[]): void {
    for (let [row, colMap] of interactionsMap) {
        for (let [col, tileInteractions] of colMap) {
            for (let i = 0; i < tileInteractions.length; ++i) {
                const interaction: Interaction = tileInteractions[i];
                interactions.push(row);
                interactions.push(col);
                interactions.push(interaction.id);
                interactions.push(interaction.interaction_type as EInteractionType);
            }
        }
    }
}

export function mapCreatureResultsToCreature(data: CreateCreatureResults): Creature {
    const creature: Creature = {
        id: data.creature.id,
        creature_name: data.creature.creature_name,
        creature_type: data.creature.creature_type,
        properties: data.properties,
        type: data.type,
        inventory: data.inventory,
        equipped: data.equipped
    };

    return creature;
}
