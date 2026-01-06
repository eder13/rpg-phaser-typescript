import * as Phaser from 'phaser';
import { SCENE_KEYS } from './scene-keys';
import { ASSET_KEYS } from '../common/assets';
import Player from '../game-objects/player/player';
import InputComponent from '../components/input-component/input';
import KeyboardInput from '../components/input-component/keyboard';
import Logger from '../common/logger';
import Spider from '../game-objects/enemies/spider';
import Saw from '../game-objects/enemies/saw';
import {
    CHEST_STATE,
    DEBUG_COLLISION_ENEMY_TILEMAP,
    DEBUG_COLLISION_PLAYER_TILEMAP,
    PLAYER_HEALTH,
    PLAYER_INVULNERABLE_DURATION,
    SAW_INVULNERABLE_DURATION,
    SPIDER_HEALTH,
} from '../common/globals';
import { Pot } from '../game-objects/objects/pot';
import { Chest } from '../game-objects/objects/chest';
import { GameObject, LevelData } from '../common/types';
import { EVENT_BUS, Events } from '../common/events';
import Fire from '../game-objects/objects/fire';
import { TiledRoomObject } from '../common/tiled/types';
import { TILED_LAYER_NAMES, TILED_TILESET_NAMES } from '../common/tiled/common';
import {
    getAllLayerNamesWithPrefix,
    getTiledChestObjectsFromMap,
    getTiledDoorObjectsFromMap,
    getTiledEnemyObjectsFromMap,
    getTiledFireObjectsFromMap,
    getTiledPotObjectsFromMap,
    getTiledRoomObjectsFromMap,
    getTiledSwitchObjectsFromMap,
} from '../common/tiled/tiled-utils';
import Door from '../game-objects/objects/door';

export class GameScene extends Phaser.Scene {
    player!: Player;
    controls!: InputComponent;
    enemyGroup!: Phaser.GameObjects.Group;
    blockingGroup!: Phaser.GameObjects.Group;
    fpsText!: HTMLElement | null;
    levelData!: LevelData;
    objectsByRoomId!: {
        [key: number]: {
            chestMap: {
                [key: number]: Chest;
            };
            doorMap: {
                [key: number]: Door;
            };
            doors: Door[];
            switches: unknown[];
            pots: Pot[];
            chests: Chest[];
            fire: Fire[];
            enemyGroup?: Phaser.GameObjects.Group;
            room: TiledRoomObject;
        };
    };
    collisionsTilemap!: Phaser.Tilemaps.TilemapLayer;
    enemyCollisionTilemap!: Phaser.Tilemaps.TilemapLayer;
    currentRoomId!: number;
    doorTransitionGroup!: Phaser.GameObjects.Group;

    private lastFpsUpdate = 0;

    constructor() {
        super({
            key: SCENE_KEYS.GAME_SCENE,
        });
    }

    public init(data): void {
        this.fpsText = document.getElementById('fps');
        this.initZoom();
        console.log('#####** init data', data);

        this.levelData = data;
        this.currentRoomId = data.roomId;
    }

    private initZoom() {
        const dpr = window.devicePixelRatio || 1;

        // base zoom
        let zoom = 1;

        // boost zoom on retina
        /* if (dpr >= 2) {
            zoom = 2;
        } */

        this.cameras.main.setZoom(zoom);
    }

    public create(): void {
        if (!this.input.keyboard) {
            //TODO show error message over the game and lock input
            Logger.error('Keyboard is not enabled!');
            return;
        }
        this.controls = new KeyboardInput(this.input.keyboard);

        const map = this.make.tilemap({ key: `${this.levelData.level}_LEVEL` });

        const collisionTiles = map.addTilesetImage(TILED_TILESET_NAMES.COLLISION, ASSET_KEYS.COLLISION);

        console.log('#####** collisionTiles', collisionTiles);

        const collisionLayer = map.createLayer(
            TILED_LAYER_NAMES.COLLISION,
            collisionTiles ? [collisionTiles] : [],
            0,
            0,
        );

        if (!collisionLayer) {
            return;
        }

        collisionLayer.setDepth(DEBUG_COLLISION_PLAYER_TILEMAP ? 3 : -1);

        this.collisionsTilemap = collisionLayer;

        const enemyCollisionsTilemap = map.createLayer(
            TILED_LAYER_NAMES.ENEMY_COLLISION,
            collisionTiles ? [collisionTiles] : [],
            0,
            0,
        );

        if (!enemyCollisionsTilemap) {
            return;
        }

        enemyCollisionsTilemap.setDepth(DEBUG_COLLISION_ENEMY_TILEMAP ? 3 : -1);

        this.enemyCollisionTilemap = enemyCollisionsTilemap;

        this.cameras.main.setScroll(0, 0);

        this.objectsByRoomId = {};

        this.doorTransitionGroup = this.add.group([]);

        this.createRoomObjects(map, TILED_LAYER_NAMES.ROOMS);

        const roomObjects = getAllLayerNamesWithPrefix(map, TILED_LAYER_NAMES.ROOMS).map((layerName) => {
            return {
                name: layerName,
                roomId: Number(layerName.split('/')[1]),
            };
        });

        const switchLayerNames = roomObjects.filter((room) => room.name.endsWith(`/${TILED_LAYER_NAMES.SWITCHES}`));
        const potsLayerNames = roomObjects.filter((room) => room.name.endsWith(`/${TILED_LAYER_NAMES.POTS}`));
        const fireLayerNames = roomObjects.filter((room) => room.name.endsWith(`/${TILED_LAYER_NAMES.FIRE}`));
        const enemyLayerNames = roomObjects.filter((room) => room.name.endsWith(`/${TILED_LAYER_NAMES.ENEMIES}`));
        const chestLayerNames = roomObjects.filter((room) => room.name.endsWith(`/${TILED_LAYER_NAMES.CHESTS}`));
        const doorLayerNames = roomObjects.filter((room) => room.name.endsWith(`/${TILED_LAYER_NAMES.DOORS}`));

        console.log('#####** doorLayerNames', doorLayerNames);

        switchLayerNames.forEach((layer) => {
            this.createSwitches(map, layer.name, layer.roomId);
        });

        potsLayerNames.forEach((layer) => {
            this.createPots(map, layer.name, layer.roomId);
        });

        fireLayerNames.forEach((layer) => {
            this.createFire(map, layer.name, layer.roomId);
        });

        enemyLayerNames.forEach((layer) => {
            this.createEnemies(map, layer.name, layer.roomId);
        });

        chestLayerNames.forEach((layer) => {
            this.createChests(map, layer.name, layer.roomId);
        });

        doorLayerNames.forEach((layer) => {
            console.log('#####** layerDoor', layer);
            this.createDoors(map, layer.name, layer.roomId);
        });

        this.add.image(0, 0, `${this.levelData.level}_BACKGROUND`).setOrigin(0);
        this.add.image(0, 0, `${this.levelData.level}_FOREGROUND`).setOrigin(0).setDepth(2);

        this.player = new Player({
            scene: this,
            position: {
                x: this.scale.width / 2 - 12,
                y: this.scale.height / 2 + 100,
            },
            assetKey: ASSET_KEYS.PLAYER,
            frame: 0,
            playerMovement: this.controls,
            isInvulnerable: false,
            invulnerableDuration: PLAYER_INVULNERABLE_DURATION,
            maxLife: PLAYER_HEALTH,
        });

        this.enemyGroup = this.add.group(
            [
                new Spider({
                    scene: this,
                    position: {
                        x: this.scale.width / 2 - 12,
                        y: this.scale.height / 2 + 50,
                    },
                    assetKey: ASSET_KEYS.SPIDER,
                    frame: 0,
                    movement: new InputComponent(),
                    isInvulnerable: false,
                    // no duration because spiders are weak enemies
                    invulnerableDuration: 0,
                    maxLife: SPIDER_HEALTH,
                }),
                new Saw({
                    scene: this,
                    position: {
                        x: this.scale.width / 2,
                        y: this.scale.height / 2 + 100,
                    },
                    assetKey: ASSET_KEYS.SAW,
                    frame: 0,
                    movement: new InputComponent(),
                    isInvulnerable: true,
                    invulnerableDuration: SAW_INVULNERABLE_DURATION,
                }),
            ],
            {
                // this way can remove the update function below
                runChildUpdate: true,
            },
        );

        this.blockingGroup = this.add.group([
            new Pot({
                scene: this,
                position: {
                    x: this.scale.width / 2,
                    y: this.scale.height / 2 + 150,
                },
            }),
            new Chest({
                scene: this,
                position: {
                    x: this.scale.width / 2,
                    y: this.scale.height / 2 - 100,
                },
                requireBossKey: false,
                chestState: CHEST_STATE.REVEALED,
            }),

            new Chest({
                scene: this,
                position: {
                    x: this.scale.width / 2 - 50,
                    y: this.scale.height / 2 - 100,
                },
                requireBossKey: true,
                chestState: CHEST_STATE.REVEALED,
            }),

            new Fire({
                scene: this,
                position: {
                    x: this.scale.width / 2 + 50,
                    y: this.scale.height / 2 - 100,
                },
            }),
        ]);

        this.registerColliders();
        this.registerCustomEvents();

        const room = this.objectsByRoomId[this.currentRoomId].room;
        this.cameras.main.setBounds(room.x, room.y - room.height, room.width, room.height);
        this.cameras.main.startFollow(this.player);
    }

    update(time: number, delta: number): void {
        // throttle FPS DOM update to reduce work (update ~4x/sec)
        if (this.fpsText && time - this.lastFpsUpdate > 250) {
            this.fpsText.innerHTML = `${Math.floor(this.game.loop.actualFps)}`;
            this.lastFpsUpdate = time;
        }
    }

    createRoomObjects(map: Phaser.Tilemaps.Tilemap, layerName: string) {
        const tiledObjectsRooms = getTiledRoomObjectsFromMap(map, layerName);
        console.log('[Rooms]', tiledObjectsRooms);

        const that = this;
        tiledObjectsRooms.forEach(function (tiledObject) {
            that.objectsByRoomId[tiledObject.id] = {
                chestMap: {},
                doorMap: {},
                doors: [],
                switches: [],
                pots: [],
                chests: [],
                fire: [],
                room: tiledObject,
            };
        });
    }

    createDoors(map: Phaser.Tilemaps.Tilemap, layerName: string, roomId: number) {
        const tiledDoorObjects = getTiledDoorObjectsFromMap(map, layerName);
        console.log('[Doors] tiledDoorObjects', tiledDoorObjects);

        tiledDoorObjects.forEach((tiledDoor) => {
            const door = new Door(this, tiledDoor, roomId);
            this.objectsByRoomId[roomId].doors.push(door);
            this.objectsByRoomId[roomId].doorMap[tiledDoor.id] = door;
            this.doorTransitionGroup.add(door.doorTransitionZone);
        });
    }

    createPots(map: Phaser.Tilemaps.Tilemap, layerName: string, roomId: number) {
        const tiledPotObjects = getTiledPotObjectsFromMap(map, layerName);
        console.log('[Pots] tiledPotObjects', tiledPotObjects);
    }

    createChests(map: Phaser.Tilemaps.Tilemap, layerName: string, roomId: number) {
        const tiledChestObjects = getTiledChestObjectsFromMap(map, layerName);
        console.log('[Chests] tiledChestObjects', tiledChestObjects);
    }

    createFire(map: Phaser.Tilemaps.Tilemap, layerName: string, roomId: number) {
        const tiledFireObjects = getTiledFireObjectsFromMap(map, layerName);
        console.log('[Fire] tiledFireObjects', tiledFireObjects);
    }

    createEnemies(map: Phaser.Tilemaps.Tilemap, layerName: string, roomId: number) {
        const tiledEnemyObjects = getTiledEnemyObjectsFromMap(map, layerName);
        console.log('[Enemies] tiledEnemyObjects', tiledEnemyObjects);
    }

    createSwitches(map: Phaser.Tilemaps.Tilemap, layerName: string, roomId: number) {
        const tiledSwitchObjects = getTiledSwitchObjectsFromMap(map, layerName);
        console.log('[Switches] tiledSwitchObjects', tiledSwitchObjects);
    }

    registerColliders() {
        // @ts-ignore
        this.enemyGroup.children.each((enemy) => {
            const enemyTyped = enemy as Spider | Saw;
            enemyTyped.setCollideWorldBounds(true);
        });

        // collision betweem player and other gameobjects
        this.physics.add.overlap(this.player, this.enemyGroup, () => {
            this.player.hit(1);
        });

        // collision between player and blocking group
        this.physics.add.collider(this.player, this.blockingGroup, (player, gameObject) => {
            this.player.collidingWithObject(gameObject as GameObject);
        });

        // collision between enemies and objects
        this.physics.add.collider(
            this.enemyGroup,
            this.blockingGroup,
            (enemy, gameObject) => {
                if (gameObject instanceof Pot) {
                    const enemyGameObject = enemy as Spider | Saw;

                    if (
                        this.player.objectHeldComponent._object &&
                        this.player.objectHeldComponent._object instanceof Pot
                    ) {
                        if (enemyGameObject instanceof Spider) {
                            enemyGameObject.hit(2);
                        }
                    }
                }
            },
            (enemy, gameObject) => {
                // collision between enemy and chest
                if (enemy instanceof Saw && gameObject instanceof Chest) {
                    return true;
                }

                // collision between enemy and pot and various logic like saw does not care
                if (
                    this.player.objectHeldComponent._object &&
                    this.player.objectHeldComponent._object instanceof Pot &&
                    enemy instanceof Saw &&
                    gameObject instanceof Pot
                ) {
                    return false;
                }
                if (
                    this.player.objectHeldComponent._object &&
                    this.player.objectHeldComponent._object instanceof Pot &&
                    enemy instanceof Spider
                ) {
                    return true;
                }

                // Collision between fire and enemies
                if (enemy instanceof Saw && gameObject instanceof Fire) {
                    return true;
                }
                if (enemy instanceof Spider && gameObject instanceof Fire) {
                    return true;
                }

                return true;
            },
        );

        this.physics.add.collider(this.player, this.collisionsTilemap);
        this.collisionsTilemap.setCollision(this.collisionsTilemap.tileset[0].firstgid);

        this.physics.add.collider(this.enemyGroup, this.enemyCollisionTilemap);
        this.enemyCollisionTilemap.setCollision(this.enemyCollisionTilemap.tileset[0].firstgid);
    }

    registerCustomEvents() {
        EVENT_BUS.on(
            Events.OPEN_CHEST,
            (chest) => {
                Logger.info(`[event]: ${Events.OPEN_CHEST}, args=${chest}`);
            },
            this,
        );
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            EVENT_BUS.off(Events.OPEN_CHEST, () => {}, this);
        });
    }
}
