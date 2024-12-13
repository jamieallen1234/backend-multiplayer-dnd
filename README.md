# DnD Multiplayer Demo

This project is a designed to simulate a 1-4 player game of DnD with an Dungeon Master.

The project makes use of programming best practices such as seperation-of-concern, MCS (model-controller-service) and ECS (entity-component-system).

MCS:
Model - Repository classes that exclusively interact with the DB tables
Controller - Controller classes that take care of security, authentication, authorization and interact with service classes
Service - Service classes that take care of business logic and interact with the models

Seperation of Concerns:
.routes - API (urls + http methods)
.controller - Incoming requests and outgoing responses
.service - Business logic
.repository - DB connections and queries
.schema - Data schemas

ECS:
Each entity is made up of components to make the data structures easily reusable and more flexible.
ex. A creature has properties, type, inventory, equipment, abilities and movement components

## How to play - Basics

1. Local server and db must be running.

2. Use postman endpoints: https://web.postman.co/workspace/a16d5e27-1295-412f-810e-4f0f1a1a5cf4/collection/40208442-77148dfd-fb08-474f-a19c-c22fc6f25786?origin=tab-menu

4. Use postman "Create Character".

3. Use postman "Create monster" at least once.

5. Use postman "Create treasure" at least once.

6. Use Postman "Create game as Player".

7. Use Postman "Get Available Games for DM".

8. Use Postman "Join Game as DM".

9. Use Postman "Start Game".

10. The game has started, so now you can move, open treasures or start combat.

11. To fight monsters they must be in the same tile as the party.

12. When combat starts, it ends only after the party's characters hp is reduced to 0 or all the monsters hp is reduced to 0.

13. When opening a treasure, the loot is randomly dispersed accross the party and put into the players inventory.

14. Any player can move the party. They must stay within the bounds of the map.

## Challenges

- Using purely relational db tables instead of JSON schemas was a lot more mork
- Due to time constraints I only added unit tests for the most important functions
- Not using sql client such as Slonik or an ORM meant more work to create queries
- Interpreting the instructions took a while

## Considerations
- I would have liked to use a limited state machine in my design:
    INITIAL -> START -> WORLD <-> COMBAT
  and a state machine for combat, so that it is clearer what state the game is in
- Websockets to update each player and DM immediately
- JWT logins for security
- pass game_id to all game endpoints to improve authorization
- Add support for NPCs, equipping items, consumable items, spells etc.
- Applying XP and leveling up after combat
- Use redis cache for gamestate instead of presisting in tables to reduce db load
- Use ZOD for schema validation
- Consider making certain operations atomic, such as joining a game

# Template - Typescript, Node.js, Express, and PostgreSQL

This project uses a basic template designed for interview purposes. It is built with TypeScript, Node.js, Express, and PostgreSQL, all containerized using Docker.

## Getting Started - Setup

Follow these steps to set up the project on your local machine for development and testing.

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v14 or higher)
- [Docker](https://www.docker.com/get-started)
- [PostgreSQL](https://www.postgresql.org/download/)

### Installation

1. **Clone the repository**:

   ```sh
   git clone https://github.com/GiulianaEOlmos/boilerplate-node-express-postgresql.git
   cd boilerplate-node-express-postgresql
   ```

### Running Docker Compose

Using Docker Compose will spin up both the server and the PostgreSQL database locally, allowing you to test and develop in an isolated environment.

1. **Build the Docker containers**:

   ```sh
   docker-compose build
   ```

2. **Start the containers:**:

   ```sh
   docker-compose up
   ```

### Stopping Docker Compose:

a. **Stop the containers but keep the data intact:**:

```sh
docker-compose down
```

b. **Stop the containers and remove the data:**:
This action will remove all the data you've added to the database. If you want to keep working with the same data, do not delete the volume. Alternatively, you should ensure the data is re-added by including it in the initial script that runs when the database starts (these scripts are located in the `sql` folder).

```sh
docker-compose down -v
```

### Running Tests

This project includes a basic test setup with Jest. Follow these steps to run the tests:

1. **Install Dependencies:**
   Ensure all dependencies are installed. If you haven't done this yet, run:

```sh
npm install
```

2. **Run Tests:**
   Execute the tests using Jest:

```sh
npm run test
```

### Endpoints

- **API Endpoints**:
  - `POST /users`: Create a new user
  - `GET /users/:id`: Retrieve a user by ID
  - `PUT /users/:id`: Update a user by ID
  - `DELETE /users/:id`: Delete a user by ID
  - `GET /users`: Retrieve all users
  - `POST /usersTransaction`: Add users as a transaction (an example of how to implement transactions if needed)

### Reference

https://dev.to/giulianaolmos/technical-interview-boilerplate-1-node-typescript-postgresql-an1
