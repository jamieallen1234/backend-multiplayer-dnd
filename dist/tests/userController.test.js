"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_controller_1 = __importDefault(require("../featuresets/user/user.controller"));
const db_1 = __importDefault(require("../db"));
jest.mock("../db");
describe("UserController", () => {
    let userController;
    let req;
    let res;
    let jsonMock;
    let statusMock;
    beforeEach(() => {
        userController = new user_controller_1.default();
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
    it("should get all users", async () => {
        const mockUsers = [{ id: 1, name: "John Doe", email: "john@example.com" }];
        db_1.default.query.mockResolvedValue({ rows: mockUsers });
        await userController.getIndex(req, res);
        expect(statusMock).toHaveBeenCalledWith(200);
        expect(jsonMock).toHaveBeenCalledWith(mockUsers);
    });
    it("should create a new user", async () => {
        const mockUser = { id: 1, name: "John Doe", email: "john@example.com" };
        req.body = { name: "John Doe", email: "john@example.com" };
        db_1.default.query.mockResolvedValue({ rows: [mockUser] });
        await userController.createUser(req, res);
        expect(statusMock).toHaveBeenCalledWith(200);
        expect(jsonMock).toHaveBeenCalledWith({
            message: "User added successfully",
            user: mockUser,
        });
    });
    it("should get a user by ID", async () => {
        const mockUser = { id: 1, name: "John Doe", email: "john@example.com" };
        req.params = { id: "1" };
        db_1.default.query.mockResolvedValue({ rows: [mockUser] });
        await userController.getUserById(req, res);
        expect(statusMock).toHaveBeenCalledWith(200);
        expect(jsonMock).toHaveBeenCalledWith([mockUser]);
    });
    it("should update a user", async () => {
        req.params = { id: "1" };
        req.body = { email: "john.new@example.com" };
        db_1.default.query.mockResolvedValue({});
        await userController.updateUser(req, res);
        expect(statusMock).toHaveBeenCalledWith(200);
        expect(jsonMock).toHaveBeenCalledWith({
            message: "User updated successfully",
        });
    });
    it("should delete a user", async () => {
        req.params = { id: "1" };
        db_1.default.query.mockResolvedValue({});
        await userController.deleteUser(req, res);
        expect(statusMock).toHaveBeenCalledWith(200);
        expect(jsonMock).toHaveBeenCalledWith({
            message: "User deleted successfully",
        });
    });
});
