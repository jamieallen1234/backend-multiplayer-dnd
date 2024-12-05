/*
export type User = {
    id: string,
    name: string,
    email: string
};
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
}

export enum ERace {
    DWARF = 'dwarf',
    ELF = 'elf',
    HUMAN = 'human'
}

export enum EItemType {
    GOLD = 'gold',
    EQUIPMENT = 'equipment' // Break this down further into weapon, armor etc.
};

export enum EInteraction {
    MONSTER = 'monster',
    NPC = 'npc',
    TREASURE = 'treasure'
}

export enum ECombatantType {
    PLAYER = 'player',
    MONSTER = 'monster'
}

export type Item = {
    id: string,
    itemId: string,
    type: EItemType;
    name: string,
    iconId: string,
}

export type GoldItem = Item & {
    amount: number
}

export type EquipmentItem = Item & {
    description: string,
    // rarity, stats etc.
}

export type Inventory = {
    id: string,
    maxItemsPerType: number,
    items: Map<EItemType, Item[]>;
};

export type Health = {
    hp: number,
    maxHp: number,
}

export type Character = {
    id: string,
    name: string,
    level: number,
    health: Health,
    abilities: Ability[] // Use EAbility to grab the proper ability from the array
    inventory: Inventory
};

export type PlayerCharacter = Character & {
    type: PlayerCharacterType,
    inventory: Inventory
};

export type CharacterType = {
    id: string,
    description: string
    class: EClass, // Assume for now that characters and monsters share the same set of classs
    race: ERace // Assume for now that characters and monsters share the same set of races
};

/**
 * Used to store the properties of a type of player character that can be used in a game instance.
 */
export type PlayerCharacterType = CharacterType & {
    // Player character specfic attributes
};

export type Monster = Character & {
    type: MonterType
    // loot: Treasure[]
}

export type MonterType = CharacterType & {
    // Monster specific attributes
}

export type Ability = {
    id: string,
    type: EAbilities,
    statTotal: number
    // Special properties
}

export type Player = {
    id: string,
    name: string,
    character: PlayerCharacter
};

export type Party = {
    id: string,
    players: Player[],
    location: Location,
}

export type DungeonMaster = {
    id: string,
    name: string,
}

export type Game = {
    id: string,
    party: Party[],
    dungeonMaster: DungeonMaster,
    map: GameMap,
    combat?: Combat
}

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
    interactionId: string,
    type: EInteraction
};

export type Treasure = {
    id: string,
    location: Location,
    items: Item[]
};

export type Combat = {
    id: string,
    monsters: Monster[],
    combatants: Combatant[] // array should be in order of combat
};

export type Combatant = {
    id: string,
    combatantId: string,
    combatantType: ECombatantType
    // Can make the object -> combatant: Monster | Character (should do the same for other versions above)
}
