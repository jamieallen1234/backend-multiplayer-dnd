import { Request, Response } from "express";
import UserController from "../../featuresets/user/user.controller";
import pool from "../../db";
import UserService from "../../featuresets/user/user.service";
import UserRepository from "../../featuresets/user/user.repository";
import { EClass, ECreatureType, EEquipment, EInteractionType, ERace, Interaction } from "../../featuresets/user/user.schema";

jest.mock("../../db");

describe("UserController", () => {
    let userRepository: UserRepository;
    let userService: UserService;
    let userController: UserController;
    let req: Partial<Request>;
    let res: Partial<Response>;
    let jsonMock: jest.Mock;
    let statusMock: jest.Mock;

    beforeEach(() => {
        userRepository = new UserRepository();
        userService = new UserService(userRepository);
        userController = new UserController(userService);
        req = {};
        jsonMock = jest.fn();
        statusMock = jest.fn().mockReturnValue({ json: jsonMock });
        res = {
            status: statusMock,
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should create a new treasure", async () => {
        const mockTreasure = { id: 1, equipment_ids: [1], consumable_ids: [1], currency_ids: [1], num_equipment: [1,10], num_consumables: [1,10], num_currencies: [1,10], created_at: Date.now(), updated_at: Date.now() };
        req.body = {
            "treasureData": {
                "equipment_ids": [1],
                "consumable_ids": [1],
                "currency_ids": [1],
                "num_equipment": {
                    "min": 1,
                    "max": 10
                },
                "num_consumables": {
                    "min": 1,
                    "max": 10
                },
                "num_currencies": {
                    "min": 1,
                    "max": 10
                }
            }
        };
        (pool.query as jest.Mock).mockResolvedValue({ rows: [mockTreasure] });
    
        await userController.createTreasure(req as Request, res as Response);
    
        expect(statusMock).toHaveBeenCalledWith(200);
        expect(jsonMock).toHaveBeenCalledWith({
            "id": 1,
            ...req.body.treasureData
        });
    });

    it("should not create a new treasure", async () => {
        req.body = {
            "treasureData": {
                "equipment_ids": [1],
                "consumable_ids": [1],
                "num_equipment": {
                    "min": 1,
                    "max": 10
                },
                "num_consumables": {
                    "min": 1,
                    "max": 10
                },
                "num_currencies": {
                    "min": 1,
                    "max": 10
                }
            }
        };

        try {
            await userController.createTreasure(req as Request, res as Response);
        } catch (e: any) {
            expect(e.message).toEqual('Could not create treasure because item data is missing.');
        }
    });

    it("should create a new monster", async () => {
        const date = Date.now();
        const mockCreatureProperties = { id: 1, lvl: 1, xp: 0, hp: 1000, abilities: [8, 10, 15, 6, 20, 9], created_at: date, updated_at: date };
        const mockCreatureType = { id: 1, class: EClass.FIGHTER, race: ERace.ORC, c_type: ECreatureType.MONSTER, created_at: date, updated_at: date };
        const mockInventory = {id: 1, equipment_capacity: 100, consumables_capacity: 1000, equipment_ids: [], consumable_ids: [], currency_ids: [], created_at: date, updated_at: date};
        const mockCreature = {id: 1, creature_name: 'Brutus the Mean', creature_type: ECreatureType.MONSTER, creature_properties_id: 1, creature_type_id: 1, inventory_id: 1, equipped_ids: new Array(EEquipment.SIZE).fill(null), created_at: date, updated_at: date};
        req.body = {
            "monsterDetails": {
                "name": "Brutus the Mean",
                "hp": 1000,
                "abilities": [8, 10, 15, 6, 20, 9],
                "class": "fighter",
                "race": "orc",
                "type": "monster",
                "equipment_capacity": 100,
                "consumables_capacity": 1000
            }
        };
        (pool.query as jest.Mock)
            .mockResolvedValueOnce({ rows: [mockCreatureProperties] })
            .mockResolvedValueOnce({ rows: [mockCreatureType] })
            .mockResolvedValueOnce({ rows: [mockInventory] })
            .mockResolvedValueOnce({ rows: [mockCreature] });
    
        (pool.connect as jest.Mock) = jest.fn().mockReturnValue({
            query: jest.fn(),
            release: jest.fn()
        });

        await userController.createMonster(req as Request, res as Response);
    
        expect(statusMock).toHaveBeenCalledWith(200);
        expect(jsonMock).toHaveBeenCalledWith({
            "id": 1,
            "creature_name": "Brutus the Mean",
            "creature_type": "monster",
            "equipped": new Array(EEquipment.SIZE).fill(null),
            "inventory": {
                "consumable_ids": [],
                "consumables_capacity": 1000,
                "created_at": date,
                "currency_ids": [],
                "equipment_capacity": 100,
                "equipment_ids": [],
                "id": 1,
                "updated_at": date,
            },
            "properties": {
                    "abilities": [8, 10, 15, 6, 20, 9],
                    "created_at": date,
                    "hp": 1000,
                    "id": 1,
                    "lvl": 1,
                    "updated_at": date,
                    "xp": 0,
            },
            "type": {
                "c_type": "monster",
                "class": "fighter",
                "created_at": date,
                "id": 1,
                "race": "orc",
                "updated_at": date,
            }
        });
    });

    it("should not create a new monster", async () => {
        const date = Date.now();
        req.body = {
            "monsterDetails": {
                "name": "Brutus the Mean",
                "hp": 1000,
                "class": "fighter",
                "race": "orc",
                "type": "monster",
                "equipment_capacity": 100,
                "consumables_capacity": 1000
            }
        };
    
        try {
            await userController.createMonster(req as Request, res as Response);
        } catch (e: any) {
            expect(e.message).toEqual('Could not create creature because abilites are missing');
        }
    });

    it("should create a new creature", async () => {
        const date = Date.now();
        const mockCreatureProperties = { id: 2, lvl: 1, xp: 0, hp: 1000, abilities: [8, 10, 15, 6, 20, 9], created_at: date, updated_at: date };
        const mockCreatureType = { id: 2, class: EClass.FIGHTER, race: ERace.HUMAN, c_type: ECreatureType.CHARACTER, created_at: date, updated_at: date };
        const mockInventory = {id: 2, equipment_capacity: 100, consumables_capacity: 1000, equipment_ids: [], consumable_ids: [], currency_ids: [], created_at: date, updated_at: date};
        const mockCreature = {id: 2, creature_name: 'Loki the Good', creature_type: ECreatureType.CHARACTER, creature_properties_id: 2, creature_type_id: 2, inventory_id: 2, equipped_ids: new Array(EEquipment.SIZE).fill(null), created_at: date, updated_at: date};
        req.body = {
            "characterData": {
                "name": "Loki the Good",
                "hp": 1000,
                "abilities": [8, 10, 15, 6, 20, 9],
                "class": "fighter",
                "race": "human",
                "type": "character",
                "equipment_capacity": 100,
                "consumables_capacity": 1000
            }
        };
        (pool.query as jest.Mock)
            .mockResolvedValueOnce({ rows: [mockCreatureProperties] })
            .mockResolvedValueOnce({ rows: [mockCreatureType] })
            .mockResolvedValueOnce({ rows: [mockInventory] })
            .mockResolvedValueOnce({ rows: [mockCreature] });
    
        (pool.connect as jest.Mock) = jest.fn().mockReturnValue({
            query: jest.fn(),
            release: jest.fn()
        });

        await userController.createCharacter(req as Request, res as Response);
    
        expect(statusMock).toHaveBeenCalledWith(200);
        expect(jsonMock).toHaveBeenCalledWith({
            "id": 2,
            "creature_name": "Loki the Good",
            "creature_type": "character",
            "equipped": new Array(EEquipment.SIZE).fill(null),
            "inventory": {
                "consumable_ids": [],
                "consumables_capacity": 1000,
                "created_at": date,
                "currency_ids": [],
                "equipment_capacity": 100,
                "equipment_ids": [],
                "id": 2,
                "updated_at": date,
            },
            "properties": {
                    "abilities": [8, 10, 15, 6, 20, 9],
                    "created_at": date,
                    "hp": 1000,
                    "id": 2,
                    "lvl": 1,
                    "updated_at": date,
                    "xp": 0,
            },
            "type": {
                "c_type": "character",
                "class": "fighter",
                "created_at": date,
                "id": 2,
                "race": "human",
                "updated_at": date,
            }
        });
    });

    it("should not create a new creature", async () => {
        const date = Date.now();
        req.body = {
            "characterData": {
                "name": "Loki the Good",
                "hp": 1000,
                "abilities": [8, 10, 15, 6, 20, 9],
                "class": "fighter",
                "race": "human",
                "type": "character",
                "equipment_capacity": 100,
                "consumables_capacity": 1000
            }
        };
    
        try {
            await userController.createCharacter(req as Request, res as Response);
        } catch (e: any) {
            expect(e.message).toEqual('Cannot create game because monster count is out of range');
        }
    });

    it("should create a new game with player", async () => {
        const date = Date.now();
        const mockGame = { id: 1, equipment_ids: [1], consumable_ids: [1], currency_ids: [1], num_equipment: [1,10], num_consumables: [1,10], num_currencies: [1,10], num_rows: 1, num_cols: 1, user_id: "biguserabc123", user_name: "big user abc", created_at: date, updated_at: date };
        req.body = {
            "gameData": {
                "player": {
                    "user_id": "biguserabc123",
                    "user_name": "big user abc",
                    "character_id": 2
                },
                "map": {
                    "num_rows": 1,
                    "num_cols": 1,
                    "min_monsters": 2,
                    "max_monsters": 2,
                    "min_treasures": 2,
                    "max_treasures": 2
                }
            }
        };
        (pool.query as jest.Mock).mockResolvedValue({ rows: [mockGame] });
    
        (pool.connect as jest.Mock) = jest.fn().mockReturnValue({
            query: jest.fn(),
            release: jest.fn()
        });

        await userController.createGame(req as Request, res as Response);

        const colMap = new Map<number, Interaction[]>();
        colMap.set(0, [{ id: 1, interaction_type: EInteractionType.MONSTER }, { id: 1, interaction_type: EInteractionType.MONSTER }, { id: 1, interaction_type: EInteractionType.TREASURE }, { id: 1, interaction_type: EInteractionType.TREASURE }])
        const expectedInteractions: Map<number, Map<number, Interaction[]>> = new Map<number, Map<number, Interaction[]>>();
        expectedInteractions.set(0, colMap);
        
        expect(statusMock).toHaveBeenCalledWith(200);
        expect(jsonMock).toHaveBeenCalledWith({
            "id": 1,
            "party": {
                "id": 1,
                "players": [
                    {
                        "id": 1,
                        "user_id": "biguserabc123",
                        "user_name": "big user abc",
                        "character_id": 2
                    }
                ],
                "location": {
                    "row": 0,
                    "col": 0
                }
            },
            "map": {
                "id": 1,
                "num_rows": 1,
                "num_cols": 1,
                "interactions": expectedInteractions
            },
            "dm": undefined,
            "active": false
        });
    });

    it("should create a new game with DM", async () => {
        const date = Date.now();
        const mockGame = { id: 1, equipment_ids: [1], consumable_ids: [1], currency_ids: [1], num_equipment: [1,10], num_consumables: [1,10], num_currencies: [1,10], num_rows: 1, num_cols: 1, user_id: "idforthemaindm123", user_name: "The Main DM", created_at: date, updated_at: date };
        req.body = {
            "gameData": {
                "dm": {
                    "user_id": "idforthemaindm123",
                    "user_name": "The Main DM"
                },
                "map": {
                    "num_rows": 1,
                    "num_cols": 1,
                    "min_monsters": 2,
                    "max_monsters": 2,
                    "min_treasures": 2,
                    "max_treasures": 2
                }
            }
        };
        (pool.query as jest.Mock).mockResolvedValue({ rows: [mockGame] });
    
        (pool.connect as jest.Mock) = jest.fn().mockReturnValue({
            query: jest.fn(),
            release: jest.fn()
        });

        await userController.createGame(req as Request, res as Response);

        const colMap = new Map<number, Interaction[]>();
        colMap.set(0, [{ id: 1, interaction_type: EInteractionType.MONSTER }, { id: 1, interaction_type: EInteractionType.MONSTER }, { id: 1, interaction_type: EInteractionType.TREASURE }, { id: 1, interaction_type: EInteractionType.TREASURE }])
        const expectedInteractions: Map<number, Map<number, Interaction[]>> = new Map<number, Map<number, Interaction[]>>();
        expectedInteractions.set(0, colMap);
        
        expect(statusMock).toHaveBeenCalledWith(200);
        expect(jsonMock).toHaveBeenCalledWith({
            "id": 1,
            "party": {
                "id": 1,
                "players": [],
                "location": {
                    "row": 0,
                    "col": 0
                }
            },
            "dm": {
                "id": 1,
                "user_id": "idforthemaindm123",
                "user_name": "The Main DM"
            },
            "map": {
                "id": 1,
                "num_rows": 1,
                "num_cols": 1,
                "interactions": expectedInteractions
            },
            "active": false
        });
    });

    it("should not create a new game with player if no treasures exist", async () => {
        const date = Date.now();
        const mockGame = { id: 1, equipment_ids: [1], consumable_ids: [1], currency_ids: [1], num_equipment: [1,10], num_consumables: [1,10], num_currencies: [1,10], num_rows: 1, num_cols: 1, user_id: "biguserabc123", user_name: "big user abc", created_at: date, updated_at: date };
        req.body = {
            "gameData": {
                "player": {
                    "user_id": "biguserabc123",
                    "user_name": "big user abc",
                    "character_id": 2
                },
                "map": {
                    "num_rows": 1,
                    "num_cols": 1,
                    "min_monsters": 2,
                    "max_monsters": 2,
                    "min_treasures": 2,
                    "max_treasures": 2
                }
            }
        };
        (pool.query as jest.Mock)
            .mockResolvedValueOnce({ rows: [] })
            .mockResolvedValueOnce({ rows: [mockGame] });
    
        (pool.connect as jest.Mock) = jest.fn().mockReturnValue({
            query: jest.fn(),
            release: jest.fn()
        });

        try {
            await userController.createGame(req as Request, res as Response);
        } catch (e: any) {
            expect(e.message).toEqual('Cannot create game because no treasure types have been generated');
        }
    });

    it("should not create a new game with player if monster map data is invalid", async () => {
        const date = Date.now();
        const mockGame = { id: 1, equipment_ids: [1], consumable_ids: [1], currency_ids: [1], num_equipment: [1,10], num_consumables: [1,10], num_currencies: [1,10], num_rows: 1, num_cols: 1, user_id: "biguserabc123", user_name: "big user abc", created_at: date, updated_at: date };
        req.body = {
            "gameData": {
                "player": {
                    "user_id": "biguserabc123",
                    "user_name": "big user abc",
                    "character_id": 2
                },
                "map": {
                    "num_rows": 1,
                    "num_cols": 1,
                    "min_monsters": 2,
                    "max_monsters": 1,
                    "min_treasures": 2,
                    "max_treasures": 2
                }
            }
        };
        (pool.query as jest.Mock).mockResolvedValue({ rows: [mockGame] });
    
        (pool.connect as jest.Mock) = jest.fn().mockReturnValue({
            query: jest.fn(),
            release: jest.fn()
        });

        try {
            await userController.createGame(req as Request, res as Response);
        } catch (e: any) {
            expect(e.message).toEqual('Cannot create game because monster count is out of range');
        }
    });

    it("should not create a new game with player if treasure map data is invalid", async () => {
        const date = Date.now();
        const mockGame = { id: 1, equipment_ids: [1], consumable_ids: [1], currency_ids: [1], num_equipment: [1,10], num_consumables: [1,10], num_currencies: [1,10], num_rows: 1, num_cols: 1, user_id: "biguserabc123", user_name: "big user abc", created_at: date, updated_at: date };
        req.body = {
            "gameData": {
                "player": {
                    "user_id": "biguserabc123",
                    "user_name": "big user abc",
                    "character_id": 2
                },
                "map": {
                    "num_rows": 1,
                    "num_cols": 1,
                    "min_monsters": 1,
                    "max_monsters": 1,
                    "min_treasures": 2,
                    "max_treasures": 1
                }
            }
        };
        (pool.query as jest.Mock).mockResolvedValue({ rows: [mockGame] });
    
        (pool.connect as jest.Mock) = jest.fn().mockReturnValue({
            query: jest.fn(),
            release: jest.fn()
        });

        try {
            await userController.createGame(req as Request, res as Response);
        } catch (e: any) {
            expect(e.message).toEqual('Cannot create game because treasure count is out of range');
        }
    });

    // TODO: Test all controller functions
});
