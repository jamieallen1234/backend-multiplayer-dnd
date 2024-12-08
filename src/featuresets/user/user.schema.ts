/*
export type User = {
    id: string,
    name: string,
    email: string
};
*/

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

/* An instance of a creature, which includes characters, monsters and npc's */
export type Creature = {
    id: number,
    name: string,
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
    id: string,
    equipment_capacity: number,
    consumables_capacity: number,
    equipment: Equipment[];
    consumables: Consumable[],
    currencies: Currency[] // use ECurrency to index into array to get desired currency 
};

export type Player = {
    id: string,
    name: string,
    character: Creature
};

export type Party = {
    id: string,
    players: Player[],
    location: Location,
};

export type DungeonMaster = {
    id: string,
    name: string,
};

export type Game = {
    id: string,
    party: Party[],
    dm: DungeonMaster,
    map: GameMap,
    combat?: Combat
};

/**
 * The map of the game instance. For simplicity we will make it a rectangular grid
 * and have only a single map.
 */
export type GameMap = {
    id: string,
    rows: number,
    cols: number,
    iteractions: Map<number, Map<number, Interaction[]>>
};

export type Interaction = {
    id: string,
    interactionId: string, // TODO: replace with Monster | NPC
    type: EInteractionType
};

export type Treasure = {
    id: string,
    location: Location,
    equipment: Equipment[],
    consumables: Consumable[],
    currencies: Currency[]
};

export type Combat = {
    id: string,
    monsters: Creature[],
    combatants: Combatant[] // array should be in order of combat
};

export type Combatant = {
    id: string,
    combatantId: string,
    combatantType: ECombatantType
    // TODO: Can make the object -> combatant: Monster | Character (should do the same for other versions above)
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
