export const MAX_PLAYERS = 4;

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
    PLAYER = 'player',
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
    col: number,
    row: number
}

export type Interaction = {
    id: number,
    interaction_type?: EInteractionType,
    // location?: Location,
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
    }
    /* Iteractions will be randomly generated as per task description */
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