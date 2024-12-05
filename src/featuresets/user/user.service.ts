import pool from "../../db";
import { User } from "./user.schema";

/**
 * Handles all db operations on the User table.
 */
class UserRepository {

    constructor() {
        
    }

    public async getIndex(): Promise<User[]> {
        const result = await pool.query("SELECT * FROM users");
        const users: User[] = result.rows;
        return users;
    }

    public async createUser(): Promise<void> {

    }

    public async getUserById(): Promise<void> {

    }

    public async updateUser(): Promise<void> {

    }

    public async deleteUser(): Promise<void> {

    }

    public async createUserTransaction(): Promise<void> {

    }
}

export default UserRepository;
