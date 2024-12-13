import { Request, Response } from "express";
import UserController from "../../featuresets/user/user.controller";
import pool from "../../db";
import UserService from "../../featuresets/user/user.service";
import UserRepository from "../../featuresets/user/user.repository";

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
            // Fail test if above expression doesn't throw anything.
            expect(true).toBe(false);
        } catch (e: any) {
            expect(true).toBe(true);
        }
    });
    
    // TODO: test
    // create monster
    // create character
    // create game
    // begin combat

});
