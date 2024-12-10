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
    MONSTER = 'monster',
    NPC = 'npc',
    TREASURE = 'treasure'
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

export type Location = {
    x: number,
    y: number
}

export type Interaction = {
    id: number,
    interaction_type?: EInteractionType,
    location?: Location,
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

export type Player = {
    id: number,
    name: string,
    character?: Creature
};

export type Party = {
    id: number,
    players: Player[],
    location: Location,
};

export type DungeonMaster = {
    id: number,
    name: string,
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
};

/**
 * The map of the game instance. For simplicity we will make it a rectangular grid
 * and have only a single map.
 */
export type GameMap = {
    id: number,
    num_rows: number,
    num_cols: number,
    // playerLocation: Location, 
    interactions: Map<number, Map<number, Interaction[]>>
};

/**
 * Loot boxes. Can be found by exploring the game map or from special interactions.
 */
export type Treasure = Interaction & {
    equipment: Equipment[],
    consumables: Consumable[],
    currencies: Currency[]
    /* Would be more interesting with random gold dropped within a range */
    /* Could randomly choose equipment or consumables from within an available pool */
};

export type Combat = {
    id: number,
    combatants: Combatant[] // array should be in order of combat
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
        user_id: number, // set if creator is joining the game as a player
        character_id?: number, // set if player has an existing character
        player_name: string,
    },
    dm?: {
        admin_id?: number, // set if the creator is joining the game as a dungeon master
        dm_name: string
    },
    map: {
        num_rows: number,
        num_cols: number,
    }
    /* Iteractions will be randomly generated as per task description */
};

export type UpdateCreatureData = Omit<Creature, 'id'>;
