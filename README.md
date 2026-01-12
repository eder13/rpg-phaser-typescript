# Dungeon Adventure

![Dungeon Screenshot](docs/showcase.png 'Dungeon')

A short zelda like dungeon adventure written in TypeScript and Phaser with a leaderboard feature for speedrunning.

![DEMO](https://dungeon.uber.space/) 

## Setup

1. install dependencies with `npm i`

2. build the game with `npm run build`

3. install dependencies for server: `cd server && npm i`

4. create the database and the corresponding user for mysql:

```
CREATE DATABASE IF NOT EXISTS db_dungeon_adventure;
CREATE USER 'dungeon'@'localhost' IDENTIFIED BY 'my-secret-password-locally';
GRANT ALL PRIVILEGES ON db_dungeon_adventure.* TO 'dungeon'@'localhost';
GRANT CREATE, DROP, REFERENCES, ALTER ON *.* TO 'dungeon'@'localhost';
```

5. create a `.env` file inside `server/` with the database link

```
DATABASE_URL="mysql://dungeon:my-secret-password-locally@localhost:3306/db_dungeon_adventure"
```

6. run prisma inside `server/`: `npx prisma generate`

7. run `npm start` inside `server/` and go to localhost:3100 to play.
