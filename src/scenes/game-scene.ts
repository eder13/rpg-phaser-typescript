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
    BLOB_HEALTH,
    BOSS_HEALTH,
    BOSS_INVULNERABLE_DURATION,
    DEBUG_COLLISION_ENEMY_TILEMAP,
    DEBUG_COLLISION_PLAYER_TILEMAP,
    DELAY_BETWEEN_FOCUS_ROOM_CAMERA,
    DELAY_DOOR_TRANSITION_DISABLED_COLLISION_OVERLAP_AND_LOCK_INPUT,
    DELAY_TWEEN_FOCUS_PLAYER_CAMERA,
    DURATION_BETWEEN_FOCUS_ROOM_CAMERA,
    DURATION_TWEEN_FOCUS_PLAYER_CAMERA,
    FREEZE_TIME_ENEMIES_ROOM_TRANSITION,
    PLAYER_HEALTH,
    PLAYER_INVULNERABLE_DURATION,
    SAW_INVULNERABLE_DURATION,
    SPIDER_HEALTH,
    WORLD_FREEZE_STATE,
    WORLD_FREEZE_STATE_PLAYER,
} from '../common/globals';
import { Pot } from '../game-objects/objects/pot';
import { Chest } from '../game-objects/objects/chest';
import { GameObject, LevelData } from '../common/types';
import { EVENT_BUS, Events } from '../common/events';
import Fire from '../game-objects/objects/fire';
import { DIRECTION, TiledRoomObject } from '../common/tiled/types';
import { DOOR_TYPE, SWITCH_ACTION, TILED_LAYER_NAMES, TILED_TILESET_NAMES, TRAP_TYPE } from '../common/tiled/common';
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
import { getDirectionOfObjectFromAnotherObject } from '../common/utils';
import { isEqual } from 'lodash';
import Blob from '../game-objects/enemies/blob';
import Spike from '../game-objects/enemies/spike';
import { Button } from '../game-objects/objects/button';
import InventoryManager from '../components/inventory/inventory';
import Boss from '../game-objects/enemies/boss';

export class GameScene extends Phaser.Scene {
    player!: Player;
    controls!: InputComponent;
    enemyGroup!: Phaser.GameObjects.Group;
    blockingGroup!: Phaser.GameObjects.Group;
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
            switches: Button[];
            pots: Pot[];
            chests: Chest[];
            fire: Fire[];
            enemyGroup: Array<Spider | Saw | Blob | Spike | Boss>;
            room: TiledRoomObject;
        };
    };
    collisionsTilemap!: Phaser.Tilemaps.TilemapLayer;
    enemyCollisionTilemap!: Phaser.Tilemaps.TilemapLayer;
    currentRoomId!: number;
    doorTransitionGroup!: Phaser.GameObjects.Group;
    doorOverlapCollider!: Phaser.Physics.Arcade.Collider;
    potsGroup!: Phaser.GameObjects.Group;
    entryDoor!: Door;
    lockedDoorsBlockingGroup!: Phaser.GameObjects.Group;
    buttonGroup!: Phaser.GameObjects.Group;
    buttonOverlapCollider!: Phaser.Physics.Arcade.Collider;
    private _freezeState = {
        enemies: new Map<Phaser.GameObjects.GameObject, { active: boolean; bodyEnabled: boolean }>(),
        pausedTweensByEnemy: new Map<Phaser.GameObjects.GameObject, Phaser.Tweens.Tween[]>(),
        pausedTweens: false,
    };
    private music?: Phaser.Sound.BaseSound;
    private hasStartedBossBattle: boolean = false;
    hasBossDefeated: boolean = false;

    constructor() {
        super({
            key: SCENE_KEYS.GAME_SCENE,
        });
    }

    public init(data): void {
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
        this.potsGroup = this.add.group([]);
        this.blockingGroup = this.add.group([]);
        this.lockedDoorsBlockingGroup = this.add.group([]);
        this.buttonGroup = this.add.group([]);
        this.enemyGroup = this.add.group(
            [],
            /*[
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
            ], */
            {
                // this way can remove the update function below
                runChildUpdate: true,
            },
        );

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
        this.add.image(0, 0, `${this.levelData.level}_FOREGROUND`).setOrigin(0).setDepth(3);

        this.player = new Player({
            scene: this,
            position: {
                // Room 1
                //x: 302,
                //y: 296,

                // Starting room (room 3)
                x: 320,
                y: 1017,

                // Room 5
                //x: 1088,
                //y: 670,

                // Room 6
                //x: 944,
                //y: 300,

                // Room 7
                //x: 1330,
                //y: 780,
            },
            assetKey: ASSET_KEYS.PLAYER,
            frame: 0,
            playerMovement: this.controls,
            isInvulnerable: false,
            invulnerableDuration: PLAYER_INVULNERABLE_DURATION,
            maxLife: PLAYER_HEALTH,
        });

        this.entryDoor = new Door(
            this,
            {
                x: 310,
                y: 1064,
                id: -1,
                isUnlocked: true,
                targetDoorId: -1,
                trapDoorTrigger: TRAP_TYPE.NONE,
                isLevelTransition: false,
                targetLevel: '',
                targetRoomId: -1,
                direction: DIRECTION.DOWN,
                doorType: DOOR_TYPE.OPEN,
                width: 20,
                height: 8,
            },
            -1,
        );

        /*         this.blockingGroup = this.add.group([
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
        ]); */

        this.registerColliders();
        this.registerCustomEvents();

        const room = this.objectsByRoomId[this.currentRoomId].room;
        this.cameras.main.setBounds(room.x, room.y - room.height, room.width, room.height);
        this.cameras.main.startFollow(this.player);

        console.log('#####** this.blockinggroup', this.blockingGroup);
        console.log('#####** this.enemyGroup', this.enemyGroup);
        console.log('#####** [btn] this.buttongroupt', this.buttonGroup);

        // run scenes in paralell (UI on top of scene)
        this.scene.launch(SCENE_KEYS.UI_SCENE);

        this.input.keyboard.on('keydown-ESC', () => {
            if (this.scene.isActive(SCENE_KEYS.PAUSE_MENU)) return;
            if (this.scene.isActive(SCENE_KEYS.START_SCREEN)) return;
            if (this.scene.isActive(SCENE_KEYS.GAME_OVER_SCENE)) return;
            if (this.scene.isActive(SCENE_KEYS.PRELOAD_SCENE)) return;
            this.scene.launch(SCENE_KEYS.PAUSE_MENU, { pausedScene: SCENE_KEYS.GAME_SCENE });
            this.scene.pause(SCENE_KEYS.GAME_SCENE);

            this.sound.pauseAll();
        });

        this.music = this.sound.add('DUNGEON_MAIN_MUSIC', { loop: true, volume: 0.5 });
        this.music.play();
    }

    update(): void {
        if (this.currentRoomId === 1) {
            this.enemyGroup.children.each((enemy) => {
                if (enemy instanceof Boss && !this.hasStartedBossBattle) {
                    enemy.startFight();
                    this.music?.stop();
                    this.music = this.sound.add('BOSS_THEME', { loop: true, volume: 0.5 });
                    this.music.play();
                    this.hasStartedBossBattle = true;
                }
                return null;
            });
        }

        if (this.hasBossDefeated) {
            this.freezeWorldWithPlayer(Infinity);
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
                enemyGroup: [],
            };
        });
    }

    createPots(map: Phaser.Tilemaps.Tilemap, layerName: string, roomId: number) {
        const tiledPotObjects = getTiledPotObjectsFromMap(map, layerName);
        console.log('[Pots] tiledPotObjects', tiledPotObjects);

        tiledPotObjects.forEach((tiledPot) => {
            const pot = new Pot({ scene: this, position: { x: tiledPot.x, y: tiledPot.y } });
            this.objectsByRoomId[roomId].pots.push(pot);
            this.blockingGroup.add(pot);
        });
    }

    createChests(map: Phaser.Tilemaps.Tilemap, layerName: string, roomId: number) {
        const tiledChestObjects = getTiledChestObjectsFromMap(map, layerName);
        console.log('[Chests] tiledChestObjects', tiledChestObjects);

        tiledChestObjects.forEach((tiledChest) => {
            console.log('#####** tiledChest.revealChestTrigger', tiledChest.revealChestTrigger);

            const chest = new Chest({
                scene: this,
                position: { x: tiledChest.x, y: tiledChest.y },
                requireBossKey: tiledChest.requiresBossKey,
                id: tiledChest.id,
                revealTrigger: tiledChest.revealChestTrigger,
                contents: tiledChest.contents,
            });
            this.objectsByRoomId[roomId].chests.push(chest);
            this.objectsByRoomId[roomId].chestMap[tiledChest.id] = chest;
            this.blockingGroup.add(chest);
        });
    }

    createFire(map: Phaser.Tilemaps.Tilemap, layerName: string, roomId: number) {
        const tiledFireObjects = getTiledFireObjectsFromMap(map, layerName);
        console.log('[Fire] tiledFireObjects', tiledFireObjects);

        tiledFireObjects.forEach((tiledFire) => {
            const fire = new Fire({ scene: this, position: { x: tiledFire.x, y: tiledFire.y } });
            this.objectsByRoomId[roomId].fire.push(fire);
            this.blockingGroup.add(fire);
        });
    }

    createEnemies(map: Phaser.Tilemaps.Tilemap, layerName: string, roomId: number) {
        const tiledEnemyObjects = getTiledEnemyObjectsFromMap(map, layerName);
        console.log('[Enemies] tiledEnemyObjects', tiledEnemyObjects);

        tiledEnemyObjects.forEach((tiledEnemy) => {
            let enemy: Spider | Saw | Blob | Spike | Boss;

            console.log('#####** tiledEnemyObject', tiledEnemy);

            if (tiledEnemy.type === 1) {
                enemy = new Spider({
                    scene: this,
                    position: { x: tiledEnemy.x, y: tiledEnemy.y },
                    assetKey: ASSET_KEYS.SPIDER_RED,
                    frame: 0,
                    movement: new InputComponent(),
                    isInvulnerable: false,
                    // no duration because spiders are weak enemies
                    invulnerableDuration: 0,
                    maxLife: SPIDER_HEALTH,
                });
            } else if (tiledEnemy.type === 2) {
                enemy = new Saw({
                    scene: this,
                    position: { x: tiledEnemy.x, y: tiledEnemy.y },
                    assetKey: ASSET_KEYS.SAW,
                    frame: 0,
                    movement: new InputComponent(),
                    isInvulnerable: true,
                    invulnerableDuration: SAW_INVULNERABLE_DURATION,
                });
            } else if (tiledEnemy.type === 3) {
                enemy = new Boss({
                    scene: this,
                    position: { x: tiledEnemy.x, y: tiledEnemy.y },
                    assetKey: ASSET_KEYS.BOSS,
                    frame: 0,
                    movement: new InputComponent(),
                    isInvulnerable: false,
                    invulnerableDuration: BOSS_INVULNERABLE_DURATION,
                    maxLife: BOSS_HEALTH,
                });
            } else if (tiledEnemy.type === 4) {
                enemy = new Spike({
                    scene: this,
                    position: { x: tiledEnemy.x, y: tiledEnemy.y },
                });
            } else {
                // type === 5
                enemy = new Blob({
                    scene: this,
                    position: { x: tiledEnemy.x, y: tiledEnemy.y },
                    assetKey: ASSET_KEYS.BLOB,
                    frame: 0,
                    movement: new InputComponent(),
                    isInvulnerable: false,
                    // no duration because spiders are weak enemies
                    invulnerableDuration: 0,
                    maxLife: BLOB_HEALTH,
                });
            }

            this.objectsByRoomId[roomId].enemyGroup.push(enemy);
            this.enemyGroup.add(enemy);
        });
    }

    createSwitches(map: Phaser.Tilemaps.Tilemap, layerName: string, roomId: number) {
        const tiledSwitchObjects = getTiledSwitchObjectsFromMap(map, layerName);
        console.log('[Switches] tiledSwitchObjects', tiledSwitchObjects);

        tiledSwitchObjects.forEach((tiledSwitch) => {
            const button = new Button(this, tiledSwitch);
            this.objectsByRoomId[roomId].switches.push(button);
            this.buttonGroup.add(button);
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

            if (door.doorObject) {
                if (door.doorType === DOOR_TYPE.LOCK || door.doorType === DOOR_TYPE.BOSS) {
                    this.lockedDoorsBlockingGroup.add(door.doorObject);
                } else {
                    this.blockingGroup.add(door.doorObject);
                }
            }
        });
    }

    registerColliders() {
        // @ts-ignore
        this.enemyGroup.children.each((enemy) => {
            //const enemyTyped = enemy as Spider | Saw;
            //enemyTyped.setCollideWorldBounds(true);
        });

        // collision betweem player and other gameobjects
        this.physics.add.overlap(this.player, this.enemyGroup, (player, enemy) => {
            this.player.hit(1);
        });

        this.physics.add.overlap(this.player, this.entryDoor.doorTransitionZone, () => {
            EVENT_BUS.emit(Events.SHOW_DIALOG, 'Your adventure just started! You cannot leave now.');
            this.time.delayedCall(2000, () => {
                EVENT_BUS.emit(Events.HIDE_DIALOG);
            });
        });

        // collision between player and blocking group
        this.physics.add.collider(this.player, this.blockingGroup, (player, gameObject) => {
            this.player.collidingWithObject(gameObject as GameObject);
        });

        // collision between player and locked doors
        this.physics.add.collider(this.player, this.lockedDoorsBlockingGroup, (player, gameObject) => {
            const correspondingDoor =
                this.objectsByRoomId[this.currentRoomId].doorMap[Number((gameObject as any).name)];

            console.log('[Locked Door Collision]', correspondingDoor);

            if (correspondingDoor.doorType === DOOR_TYPE.LOCK && InventoryManager.getInstance().useKey()) {
                correspondingDoor.openDoor();
            }

            if (correspondingDoor.doorType === DOOR_TYPE.BOSS && InventoryManager.getInstance().hasBossKey()) {
                correspondingDoor.openDoor();
            }
        });

        // collision between enemies and objects
        this.physics.add.collider(
            this.enemyGroup,
            this.blockingGroup,
            (enemy, gameObject) => {
                if (gameObject instanceof Pot) {
                    const enemyGameObject = enemy as Spider | Saw | Blob;
                    const isEqualComponent = isEqual(this.player.objectHeldComponent._object, gameObject);

                    if (
                        this.player.objectHeldComponent._object &&
                        this.player.objectHeldComponent._object instanceof Pot &&
                        isEqualComponent
                    ) {
                        if (enemyGameObject instanceof Spider || enemyGameObject instanceof Blob) {
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
                if (enemy instanceof Saw && gameObject instanceof Pot) {
                    return false;
                }
                if (
                    this.player.objectHeldComponent._object &&
                    this.player.objectHeldComponent._object instanceof Pot &&
                    enemy instanceof Spider
                ) {
                    return true;
                }

                console.log('#####** [pot]', this.player.objectHeldComponent._object);

                if (
                    this.player.objectHeldComponent._object &&
                    this.player.objectHeldComponent._object instanceof Pot &&
                    enemy instanceof Blob
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

        this.physics.add.collider(this.blockingGroup, this.enemyCollisionTilemap);
        // enable collision for all tiles on the layer (sauberste Option)
        this.enemyCollisionTilemap.setCollisionByExclusion([-1], true);

        // debug: prüfe, ob Enemies Bodies haben
        // @ts-ignore
        this.enemyGroup.children.each((e: any) => {
            console.log('ENEMY BODY CHECK', e.constructor?.name, 'body=', !!e.body, e.body);
        });

        // add collider with callback (tile callback signature: (gameObject, tile) => void)
        this.physics.add.collider(
            this.enemyGroup,
            this.enemyCollisionTilemap,
            (enemyObj: any) => {
                const enemy = enemyObj.body && enemyObj.body.gameObject ? enemyObj.body.gameObject : enemyObj;

                if (!(enemy instanceof Saw)) return;

                // get arcade body
                const body = (enemy as any).body as Phaser.Physics.Arcade.Body | undefined;
                if (!body) return;

                const enemyGroup = this.objectsByRoomId[this.currentRoomId].enemyGroup;

                const sawsInRoom = enemyGroup.every((enemy) => {
                    return enemy instanceof Saw && enemy.active === true;
                });

                if (!sawsInRoom) return;

                // current blocked state
                const nowBlocked = {
                    left: !!body.blocked.left,
                    right: !!body.blocked.right,
                    up: !!body.blocked.up,
                    down: !!body.blocked.down,
                };

                // previous blocked state (stored on the enemy)
                const prev = (enemy.getData && enemy.getData('wasBlocked')) ||
                    enemy.wasBlocked || { left: false, right: false, up: false, down: false };

                // detect newly blocked side (transition false -> true)
                const newlyBlocked =
                    (nowBlocked.left && !prev.left) ||
                    (nowBlocked.right && !prev.right) ||
                    (nowBlocked.up && !prev.up) ||
                    (nowBlocked.down && !prev.down);

                // store current blocked state for next time
                if (enemy.setData) enemy.setData('wasBlocked', nowBlocked);
                else enemy.wasBlocked = nowBlocked;

                if (!newlyBlocked) {
                    // nothing new, ignore (prevents multi-tile / multi-frame spam)
                    return;
                }

                // optional extra cooldown (ms) to avoid very rapid retriggering
                const now = this.time.now;
                const last = (enemy.getData && enemy.getData('lastWallHit')) || enemy.lastWallHit || 0;
                if (now - last < 1000) return;
                if (enemy.setData) enemy.setData('lastWallHit', now);
                else enemy.lastWallHit = now;

                const key = 'SFX_SAW_HIT_WALL';
                if (this.cache.audio.exists(key)) {
                    this.sound.play(key, { volume: 0.2 });
                } else {
                    console.warn(`Audio key "${key}" not found when Saw hit wall`);
                }
            },
            undefined,
            this,
        );

        this.doorOverlapCollider = this.physics.add.overlap(this.player, this.doorTransitionGroup, (_, doorObject) => {
            this.handleRoomTransition(doorObject as Phaser.Types.Physics.Arcade.GameObjectWithBody);
        });

        this.buttonOverlapCollider = this.physics.add.overlap(this.player, this.buttonGroup, (_, button) => {
            this.handleButtonPressed(button as Phaser.Types.Physics.Arcade.GameObjectWithBody);
        });
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

        EVENT_BUS.on(
            Events.ENEMY_DEFEATED,
            (enemy: Blob | Spider) => {
                Logger.info(`[event]: ${Events.ENEMY_DEFEATED}, args=${JSON.stringify(enemy)}`);

                const enemyGroup = this.objectsByRoomId[this.currentRoomId].enemyGroup;

                const allEnemiesAreDefeatedForCurrentRoom = enemyGroup.every((enemy) => {
                    return enemy.active === false;
                });

                console.log('[enemies defeated] ', allEnemiesAreDefeatedForCurrentRoom);

                if (allEnemiesAreDefeatedForCurrentRoom) {
                    this.handleAllEnemiesDefeatedForRoom();
                }
            },
            this,
        );
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            EVENT_BUS.off(Events.ENEMY_DEFEATED, () => {}, this);
        });

        EVENT_BUS.on(
            Events.PLAYER_DEFEATED,
            (player: Player) => {
                Logger.info(`[event]: ${Events.PLAYER_DEFEATED}, args=${JSON.stringify(player)}`);
                this.handlePlayerDefeated(player);
            },
            this,
        );
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            EVENT_BUS.off(Events.PLAYER_DEFEATED, () => {}, this);
        });

        EVENT_BUS.on(
            Events.BOSS_DEFEATED,
            (boss: Boss) => {
                Logger.info(`[event]: ${Events.BOSS_DEFEATED}, args=${JSON.stringify(boss)}`);
                this.handleBossDefeated(boss);
            },
            this,
        );
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            EVENT_BUS.off(Events.BOSS_DEFEATED, () => {}, this);
        });
    }

    public freezeWorldWithPlayer(ms: number) {
        WORLD_FREEZE_STATE_PLAYER.isFrozen = true;
        this.freezeWorldExceptPlayer(ms, true);
    }

    // Freeze world except player for ms milliseconds
    public freezeWorldExceptPlayer(ms: number, freezePlayer: boolean) {
        WORLD_FREEZE_STATE.isFrozen = true;

        // store & disable enemies
        this._freezeState.enemies.clear();
        // enemyGroup kann undefined sein -> guard
        if (this.enemyGroup) {
            // @ts-ignore (Phaser Group children type)
            this.enemyGroup.children.each((enemy: Phaser.GameObjects.GameObject) => {
                if (!enemy) return;
                const body = (enemy as any).body as Phaser.Physics.Arcade.Body | undefined;
                this._freezeState.enemies.set(enemy, {
                    active: (enemy as any).active,
                    bodyEnabled: !!body && !!body.enable,
                });
                // disable update handlers and physics for enemy
                (enemy as any).active = false;
                if (body) body.enable = false;
                // pause enemy animation if present
                if ((enemy as any).anims && (enemy as any).anims.isPlaying) {
                    (enemy as any).anims.pause();
                }

                // collect and pause all tweens that target this enemy
                const tweensForEnemy = this.tweens.getTweensOf(enemy);
                if (tweensForEnemy && tweensForEnemy.length > 0) {
                    this._freezeState.pausedTweensByEnemy.set(enemy, tweensForEnemy.slice());
                    tweensForEnemy.forEach((t) => t.pause());
                }
            });
        }

        // optional: pause ALL tweens (less granular)
        // this.tweens.pauseAll();
        this._freezeState.pausedTweens = true;

        this.time.delayedCall(ms, () => {
            if (freezePlayer) {
                this.unfreezeWorldWithPlayer();
            } else {
                this.unfreezeWorldExceptPlayer();
            }
        });
    }

    public unfreezeWorldWithPlayer() {
        WORLD_FREEZE_STATE_PLAYER.isFrozen = false;
        this.unfreezeWorldExceptPlayer();
    }

    public unfreezeWorldExceptPlayer() {
        WORLD_FREEZE_STATE.isFrozen = false;

        // restore enemies
        this._freezeState.enemies.forEach((state, enemy) => {
            (enemy as any).active = state.active;
            const body = (enemy as any).body as Phaser.Physics.Arcade.Body | undefined;
            if (body) body.enable = state.bodyEnabled;
            // resume animations if present
            if ((enemy as any).anims) {
                (enemy as any).anims.resume();
            }

            // resume tweens that were paused for this enemy
            const paused = this._freezeState.pausedTweensByEnemy.get(enemy);
            if (paused) {
                paused.forEach((t) => t.resume());
            }
        });
        this._freezeState.enemies.clear();
        this._freezeState.pausedTweensByEnemy.clear();

        if (this._freezeState.pausedTweens) {
            // if you used pauseAll uncomment resumeAll(), otherwise kept for flag symmetry
            // this.tweens.resumeAll();
            this._freezeState.pausedTweens = false;
        }
    }

    async handleRoomTransition(doorCollidedGameObject: Phaser.Types.Physics.Arcade.GameObjectWithBody) {
        this.player.controls.locked = true;

        console.log('#####** door trigger', doorCollidedGameObject);
        console.log(`Transitioning to door: ${doorCollidedGameObject.name}`);

        const door = this.objectsByRoomId[this.currentRoomId].doorMap[Number(doorCollidedGameObject.name)];
        console.log('#####** door', door);
        const targetDoor = this.objectsByRoomId[door.targetRoomId].doorMap[door.targetDoorId];
        console.log('#####** targetDoor', targetDoor);

        // Disable collision for a short amount of time to "travel through" the door
        door.disableObject();
        targetDoor.disableObject();

        this.doorOverlapCollider.active = false;
        this.controls.locked = true;

        this.freezeWorldExceptPlayer(FREEZE_TIME_ENEMIES_ROOM_TRANSITION, false);
        this.time.delayedCall(DELAY_DOOR_TRANSITION_DISABLED_COLLISION_OVERLAP_AND_LOCK_INPUT, () => {
            this.controls.locked = false;

            if (this.doorOverlapCollider) {
                this.doorOverlapCollider.active = true;
                this.controls.locked = false;
            }
        });

        console.log('#####** door.direction', door.direction);
        console.log('#####** targetDoor.direction', targetDoor.direction);

        const targetDirection = getDirectionOfObjectFromAnotherObject(door.position, targetDoor.position);
        console.log('#####** targetDirection', targetDirection);

        const doorDistance = {
            x: Math.abs((targetDoor.position.x - door.position.x) / 2),
            y: Math.abs((targetDoor.position.y - door.position.y) / 2),
        };

        if (targetDirection === DIRECTION.LEFT) {
            doorDistance.x = doorDistance.x * -1;
        }

        if (targetDirection === DIRECTION.UP) {
            doorDistance.y = doorDistance.y * -1;
        }

        const playerNewPosition = {
            x:
                door.position.x +
                door.doorTransitionZone.width / 2 +
                doorDistance.x +
                (targetDirection === DIRECTION.LEFT ? -60 : targetDirection === DIRECTION.RIGHT ? 60 : 0),
            y:
                (targetDirection === DIRECTION.LEFT
                    ? door.position.y - door.doorTransitionZone.height / 2
                    : targetDirection === DIRECTION.RIGHT
                      ? door.position.y - door.doorTransitionZone.height / 2
                      : door.position.y + door.doorTransitionZone.height / 2) +
                doorDistance.y +
                (targetDirection === DIRECTION.UP ? -70 : targetDirection === DIRECTION.DOWN ? 60 : 0),
        };

        this.tweens.add({
            targets: this.player,
            x: playerNewPosition.x,
            y: playerNewPosition.y,
            delay: DELAY_TWEEN_FOCUS_PLAYER_CAMERA,
            duration: DURATION_TWEEN_FOCUS_PLAYER_CAMERA,
            ease: 'Power2',
        });

        this.cameras.main.setBounds(
            this.cameras.main.worldView.x,
            this.cameras.main.worldView.y,
            this.cameras.main.worldView.width,
            this.cameras.main.worldView.height,
        );

        const roomSize = this.objectsByRoomId[targetDoor.roomid].room;
        // reset camera bounds so we have a smooth transition
        this.cameras.main.setBounds(
            this.cameras.main.worldView.x,
            this.cameras.main.worldView.y,
            this.cameras.main.worldView.width,
            this.cameras.main.worldView.height,
        );
        this.cameras.main.stopFollow();
        const bounds = this.cameras.main.getBounds();

        console.log('#####** roomSize.width', roomSize.width);
        console.log('#####** roomSize.height', roomSize.height);

        this.tweens.add({
            targets: bounds,
            x: roomSize.x,
            y: roomSize.y - roomSize.height,
            duration: DURATION_BETWEEN_FOCUS_ROOM_CAMERA,
            delay: DELAY_BETWEEN_FOCUS_ROOM_CAMERA,
            onUpdate: () => {
                this.cameras.main.setBounds(bounds.x, bounds.y, roomSize.width, roomSize.height);
            },
        });

        this.cameras.main.startFollow(this.player);

        this.currentRoomId = targetDoor.roomid;

        // simulate chest reveal
        //this.objectsByRoomId[this.currentRoomId].chestMap[1].revealChest();
        //this.objectsByRoomId[this.currentRoomId].chestMap[2].revealChest();
    }

    private handleButtonPressed(button: Phaser.Types.Physics.Arcade.GameObjectWithBody) {
        const buttonObject = this.objectsByRoomId[this.currentRoomId].switches.find(
            (btn) => btn?.body?.gameObject === button.body.gameObject,
        );
        const buttonData = buttonObject?.buttonPressed?.();

        console.log('[btn] buttonObject:', buttonObject);
        console.log('[btn] Button Action:', buttonData?.action);
        console.log('[btn] Target IDs:', buttonData?.targetIds);

        if (buttonData?.action === SWITCH_ACTION.NOTHING) {
            return;
        } else if (buttonData?.action === SWITCH_ACTION.OPEN_DOOR) {
            buttonData?.targetIds.forEach((targetId) => {
                const targetDoor = this.objectsByRoomId[this.currentRoomId].doors.find((door) => door.id === targetId);

                console.log(
                    '#####** [btn] this.objectsByRoomId[this.currentRoomId].doors',
                    this.objectsByRoomId[this.currentRoomId].doors,
                );
                console.log('[btn] #####** targetDoor', targetDoor);

                targetDoor?.openDoor?.();
            });
        } else if (buttonData?.action === SWITCH_ACTION.REVEAL_CHEST) {
            buttonData?.targetIds.forEach((targetId) => {
                const chest = this.objectsByRoomId[this.currentRoomId].chestMap[targetId];

                console.log(
                    '#####** [btn] this.objectsByRoomId[this.currentRoomId].chestMap',
                    this.objectsByRoomId[this.currentRoomId].chestMap,
                );
                console.log('[btn] #####** chest', chest);

                chest?.revealChest?.();
            });
        }
    }

    private handlePlayerDefeated(player: Player) {
        console.log('[player defeated] Player defeated:', player);

        // Handle player defeat logic
        this.cameras.main.fadeOut(1000, 0, 0, 0);

        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start(SCENE_KEYS.GAME_OVER_SCENE);
            this.sound.stopAll();
            this.scene.stop(SCENE_KEYS.UI_SCENE);
        });
    }

    private handleAllEnemiesDefeatedForRoom() {
        console.log('[enemies defeated] All enemies defeated in room:', this.currentRoomId);

        // open Doors again
        const doors = this.objectsByRoomId[this.currentRoomId].doors;
        doors.forEach((door) => {
            if (
                door.doorObject &&
                door.doorType === DOOR_TYPE.TRAP &&
                door.trapDoorTrigger === TRAP_TYPE.ENEMIES_DEFEATED
            ) {
                door.openDoor();
            }
        });
    }

    private handleBossDefeated(boss: Boss) {
        console.log('[boss defeated] Boss defeated:', boss);
        // Handle boss defeat logic
        this.hasBossDefeated = true;

        // Handle player defeat logic
        this.cameras.main.fadeOut(1000, 0, 0, 0);

        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start(SCENE_KEYS.CONGRATULATIONS);
            this.sound.stopAll();
            this.scene.stop(SCENE_KEYS.UI_SCENE);
        });
    }

    get currentRoomWithId() {
        return this.currentRoomId;
    }
}
