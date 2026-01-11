# Dungeon Adventure

![Dungeon Screenshot](docs/showcase.png 'Dungeon')

A short zelda like dungeon adventure written in TypeScript and Phaser with a leaderboard feature for speedrunning.

## Setup

1. install dependencies with `npm i`

2. do the same for the server `cd server && npm i`

3. create the database and the corresponding user for mysql:

```
CREATE DATABASE IF NOT EXISTS db_dungeon_adventure;
CREATE USER 'dungeon'@'localhost' IDENTIFIED BY 'my-secret-password-locally';
GRANT ALL PRIVILEGES ON db_dungeon_adventure.* TO 'dungeon'@'localhost';
GRANT CREATE, DROP, REFERENCES, ALTER ON *.* TO 'dungeon'@'localhost';
```

4. create a `.env` file inside `server/` with the database link

```
DATABASE_URL="mysql://dungeon:my-secret-password-locally@localhost:3306/db_dungeon_adventure"
```

5. Run prisma: `npx prisma generate`

6. Run `npm start` inside `server/` and go to localhost:3100 to play.
