/* Enums */
CREATE TYPE e_creature_type AS ENUM ('character', 'monster', 'npc');
CREATE TYPE e_class AS ENUM ('fighter', 'monk', 'rogue', 'ranger', 'wizard');
CREATE TYPE e_race AS ENUM ('dwarf', 'elf', 'human', 'orc');
CREATE TYPE e_item AS ENUM('equipment', 'consumable', 'currency');
CREATE TYPE e_equipment AS ENUM ('head', 'torso', 'legs', 'hands', 'feet', 'ring', 'necklace');
CREATE TYPE e_currency AS ENUM('gold', 'silver');
CREATE TYPE e_consumable AS ENUM('potion', 'revive');

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
    creature_properties_id integer REFERENCES creature_properties (id) NOT NULL,
    creature_type_id integer REFERENCES creature_types (id) NOT NULL,
    inventory_id integer REFERENCES inventories (id) NOT NULL,
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

/* Equipment worn by a creature instance */
/*
CREATE TABLE IF NOT EXISTS creature_equipments (
    id SERIAL PRIMARY KEY,
    head_id integer REFERENCES items (id) DEFAULT NULL,
    torso_id integer REFERENCES items (id) DEFAULT NULL,
    legs_id integer REFERENCES items (id) DEFAULT NULL,
    hands_id integer REFERENCES items (id) DEFAULT NULL,
    feet_id integer REFERENCES items (id) DEFAULT NULL,
    ring_id integer REFERENCES items (id) DEFAULT NULL,
    necklace_id integer REFERENCES items (id) DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT current_timestamp,
    updated_at TIMESTAMP NOT NULL DEFAULT current_timestamp
);
*/

/* Items that can be held by creatures */
/*
CREATE TABLE IF NOT EXISTS items (
    id SERIAL PRIMARY KEY,
    item_id integer NOT NULL,
    item_type e_item NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT current_timestamp,
    updated_at TIMESTAMP NOT NULL DEFAULT current_timestamp,
    unique (id, item_id, item_type)
);
*/

/* Ability stats for a creature instance */
/*
CREATE TABLE IF NOT EXISTS abilities (
    id SERIAL PRIMARY KEY,
    strength NUMERIC(3, 0) NOT NULL,
    dexterity NUMERIC(3, 0) NOT NULL,
    constitution NUMERIC(3, 0) NOT NULL,
    intelligence NUMERIC(3, 0) NOT NULL,
    wisdom NUMERIC(3, 0) NOT NULL,
    charisma NUMERIC(3, 0) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT current_timestamp,
    updated_at TIMESTAMP NOT NULL DEFAULT current_timestamp
);
*/