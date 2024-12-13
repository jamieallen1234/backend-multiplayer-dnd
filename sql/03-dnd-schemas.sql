/* Enums */
CREATE TYPE e_creature_type AS ENUM ('character', 'monster', 'npc');
CREATE TYPE e_class AS ENUM ('fighter', 'monk', 'rogue', 'ranger', 'wizard');
CREATE TYPE e_race AS ENUM ('dwarf', 'elf', 'human', 'orc');
CREATE TYPE e_item AS ENUM('equipment', 'consumable', 'currency');
CREATE TYPE e_equipment AS ENUM ('head', 'torso', 'legs', 'hands', 'feet', 'ring', 'necklace');
CREATE TYPE e_currency AS ENUM('gold', 'silver');
CREATE TYPE e_consumable AS ENUM('potion', 'revive');
CREATE TYPE e_combatant_type AS ENUM('character', 'monster');

/* Creature properties are any properties on a creature that get modified by leveling up */
CREATE TABLE IF NOT EXISTS creature_properties (
    id SERIAL PRIMARY KEY,
    lvl NUMERIC(3, 0) NOT NULL DEFAULT 1,
    xp NUMERIC(7, 0) NOT NULL DEFAULT 1,
    hp NUMERIC(4, 0) NOT NULL,
    abilities integer ARRAY DEFAULT array[]::integer[],
    created_at TIMESTAMP NOT NULL DEFAULT current_timestamp,
    updated_at TIMESTAMP NOT NULL DEFAULT current_timestamp
    /* special_abilities_ids integer ARRAY DEFAULT array[]::integer[], */
    /* ex_abilities_ids integer ARRAY DEFAULT array[]::integer[], */
);

/* Attributes that define a unique type of creature, including class, race and type */
CREATE TABLE IF NOT EXISTS creature_types (
    id SERIAL PRIMARY KEY,
    class e_class NOT NULL,
    race e_race NOT NULL,
    c_type e_creature_type NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT current_timestamp,
    updated_at TIMESTAMP NOT NULL DEFAULT current_timestamp,
    unique (id, class, race, c_type)
);

/* A creature instance's inventory */
CREATE TABLE IF NOT EXISTS inventories (
    id SERIAL PRIMARY KEY,
    equipment_capacity NUMERIC(3, 0),
    consumables_capacity NUMERIC(4, 0),
    equipment_ids integer ARRAY DEFAULT array[]::integer[], /* references equipment id */
    consumable_ids integer ARRAY DEFAULT array[]::integer[], /* references consumables id */
    currency_ids integer ARRAY DEFAULT array[]::integer[], /* references currencies id */
    created_at TIMESTAMP NOT NULL DEFAULT current_timestamp,
    updated_at TIMESTAMP NOT NULL DEFAULT current_timestamp
);

/* An instance of a creature, which includes characters, monsters and npc's */
CREATE TABLE IF NOT EXISTS creatures (
    id SERIAL PRIMARY KEY,
    creature_name VARCHAR(255) NOT NULL,
    creature_type e_creature_type NOT NULL,
    creature_properties_id integer REFERENCES creature_properties(id) NOT NULL,
    creature_type_id integer REFERENCES creature_types(id) NOT NULL,
    inventory_id integer REFERENCES inventories(id) NOT NULL,
    equipped_ids integer ARRAY DEFAULT array[]::integer[], /* references equipment id */
    created_at TIMESTAMP NOT NULL DEFAULT current_timestamp,
    updated_at TIMESTAMP NOT NULL DEFAULT current_timestamp
);

/* Equipment for creatures or inside of treasures */
CREATE TABLE IF NOT EXISTS equipment (
    id SERIAL PRIMARY KEY,
    equipment_name VARCHAR(255) NOT NULL,
    equipment_type e_equipment NOT NULL,
    ability_modifiers integer ARRAY DEFAULT array[]::integer[],
    created_at TIMESTAMP NOT NULL DEFAULT current_timestamp,
    updated_at TIMESTAMP NOT NULL DEFAULT current_timestamp,
    unique (id, equipment_name)
    /* equipable requirements */
    /* special properties */
);

/* Consumables for creatures or inside of treasures */
CREATE TABLE IF NOT EXISTS consumables (
    id SERIAL PRIMARY KEY,
    consumable_name VARCHAR(255) NOT NULL,
    consumable_type e_consumable NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT current_timestamp,
    updated_at TIMESTAMP NOT NULL DEFAULT current_timestamp,
    unique (id, consumable_name)
    /* special properties */
);

/* Currency instances held by creatures or inside of treasures */
CREATE TABLE IF NOT EXISTS currencies (
    id SERIAL PRIMARY KEY,
    currency_type e_currency NOT NULL,
    total NUMERIC(7, 0) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT current_timestamp,
    updated_at TIMESTAMP NOT NULL DEFAULT current_timestamp
);

CREATE TABLE IF NOT EXISTS player (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    character_id integer REFERENCES creatures(id) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT current_timestamp,
    updated_at TIMESTAMP NOT NULL DEFAULT current_timestamp
);

CREATE TABLE IF NOT EXISTS party (
    id SERIAL PRIMARY KEY,
    player_ids integer ARRAY DEFAULT array[]::integer[],
    party_location integer ARRAY NOT NULL, /* formatted [row, col] */
    created_at TIMESTAMP NOT NULL DEFAULT current_timestamp,
    updated_at TIMESTAMP NOT NULL DEFAULT current_timestamp
);

CREATE TABLE IF NOT EXISTS dungeon_master (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT current_timestamp,
    updated_at TIMESTAMP NOT NULL DEFAULT current_timestamp
);

CREATE TABLE IF NOT EXISTS combatant (
    id SERIAL PRIMARY KEY,
    creature_id integer REFERENCES creatures(id) NOT NULL,
    combatant_type e_combatant_type NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT current_timestamp,
    updated_at TIMESTAMP NOT NULL DEFAULT current_timestamp
);

CREATE TABLE IF NOT EXISTS combat (
    id SERIAL PRIMARY KEY,
    combatant_ids integer ARRAY DEFAULT array[]::integer[], /* references combatant id */
    combatant_turn_index NUMERIC(2, 0) NOT NULL DEFAULT 0,
    fainted_monster_ids integer ARRAY DEFAULT array[]::integer[],
    fainted_character_ids integer ARRAY DEFAULT array[]::integer[],
    created_at TIMESTAMP NOT NULL DEFAULT current_timestamp,
    updated_at TIMESTAMP NOT NULL DEFAULT current_timestamp
);

/* Defines what loot can be found inside of a treasure chest */
CREATE TABLE IF NOT EXISTS treasure_type (
    id SERIAL PRIMARY KEY,
    equipment_ids integer ARRAY DEFAULT array[]::integer[], /* references equipment id */
    consumable_ids integer ARRAY DEFAULT array[]::integer[], /* references consumables id */
    currency_ids integer ARRAY DEFAULT array[]::integer[], /* references currencies id */
    num_equipment integer ARRAY DEFAULT array[]::integer[], /* [min, max] */
    num_consumables integer ARRAY DEFAULT array[]::integer[],/* [min, max] */
    num_currencies integer ARRAY DEFAULT array[]::integer[], /* [min, max] */
    created_at TIMESTAMP NOT NULL DEFAULT current_timestamp,
    updated_at TIMESTAMP NOT NULL DEFAULT current_timestamp
    /* Should expand this to differentiate between random loot and guarenteed loot, and random loot should be weighted */
);

CREATE TABLE IF NOT EXISTS treasure (
    id SERIAL PRIMARY KEY,
    treasure_type_id integer REFERENCES creatures NOT NULL,
    opened VARCHAR(5) NOT NULL DEFAULT 'false',
    created_at TIMESTAMP NOT NULL DEFAULT current_timestamp,
    updated_at TIMESTAMP NOT NULL DEFAULT current_timestamp
);

CREATE TABLE IF NOT EXISTS game_map (
    id SERIAL PRIMARY KEY,
    num_rows NUMERIC(7, 0) NOT NULL,
    num_cols NUMERIC(7, 0) NOT NULL,
    interactions integer ARRAY DEFAULT array[]::integer[], /* formatted [row, col, interaction_id, interaction_type, ...] */
    created_at TIMESTAMP NOT NULL DEFAULT current_timestamp,
    updated_at TIMESTAMP NOT NULL DEFAULT current_timestamp
);

CREATE TABLE IF NOT EXISTS game (
    id SERIAL PRIMARY KEY,
    party_id integer REFERENCES party(id) NOT NULL,
    dm_id integer REFERENCES dungeon_master(id) DEFAULT NULL,
    map_id integer REFERENCES game_map(id) NOT NULL,
    combat_id integer REFERENCES combat(id) DEFAULT NULL,
    active VARCHAR(5) NOT NULL DEFAULT 'false',
    created_at TIMESTAMP NOT NULL DEFAULT current_timestamp,
    updated_at TIMESTAMP NOT NULL DEFAULT current_timestamp
);
