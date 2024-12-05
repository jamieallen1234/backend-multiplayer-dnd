"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../../db"));
// https://node-postgres.com/features/queries
class UserController {
    async getIndex(req, res) {
        try {
            const result = await db_1.default.query("SELECT * FROM users");
            console.log({ result: JSON.stringify(result) });
            res.status(200).json(result.rows);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        }
    }
    async createUser(req, res) {
        try {
            const { name, email } = req.body;
            const result = await db_1.default.query("INSERT INTO users (name, email) VALUES ($1, $2)", [name, email]);
            console.log({ result: JSON.stringify(result) });
            res
                .status(200)
                .json({ message: "User added successfully", user: result.rows[0] });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        }
    }
    async getUserById(req, res) {
        try {
            const id = parseInt(req.params.id);
            const result = await db_1.default.query("SELECT * FROM users WHERE id = $1", [
                id,
            ]);
            res.status(200).json(result.rows);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        }
    }
    async updateUser(req, res) {
        try {
            const id = parseInt(req.params.id);
            const { email } = req.body;
            const result = await db_1.default.query("UPDATE users SET email = $1 WHERE id = $2", [email, id]);
            res.status(200).json({ message: "User updated successfully" });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        }
    }
    async deleteUser(req, res) {
        try {
            const id = parseInt(req.params.id);
            const result = await db_1.default.query("DELETE FROM users WHERE id = $1", [id]);
            res.status(200).json({ message: "User deleted successfully" });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        }
    }
    //https://node-postgres.com/features/transactions
    async createUserTransaction(req, res) {
        const client = await db_1.default.connect();
        try {
            await client.query("BEGIN");
            const users = req.body.users;
            const promises = [];
            for (const user of users) {
                const { name, email } = user;
                promises.push(client.query("INSERT INTO users (name, email) VALUES ($1, $2)", [
                    name,
                    email,
                ]));
            }
            await Promise.all(promises);
            await client.query("COMMIT");
            res.status(200).json({ message: "Users added successfully" });
        }
        catch (error) {
            console.error(error);
            await client.query("ROLLBACK");
            res.status(500).json({ error: error.message });
        }
    }
}
exports.default = UserController;
