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
    CHEST_STATE,
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
} from '../common/globals';
import { Pot } from '../game-objects/objects/pot';
import { Chest } from '../game-objects/objects/chest';
import { GameObject, LevelData } from '../common/types';
import { EVENT_BUS, Events } from '../common/events';
import Fire from '../game-objects/objects/fire';
import { DIRECTION, TiledRoomObject } from '../common/tiled/types';
import { DOOR_TYPE, TILED_LAYER_NAMES, TILED_TILESET_NAMES, TRAP_TYPE } from '../common/tiled/common';
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
            switches: Button[];
            pots: Pot[];
            chests: Chest[];
            fire: Fire[];
            enemyGroup: Array<Spider | Saw | Blob | Spike>;
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

    private lastFpsUpdate = 0;

    private _freezeState = {
        enemies: new Map<Phaser.GameObjects.GameObject, { active: boolean; bodyEnabled: boolean }>(),
    };

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
                x: 320,
                y: 1017,
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
            let enemy: Spider | Saw | Blob | Spike;

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
                // TODO: Boss
                return;
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
        this.physics.add.overlap(this.player, this.enemyGroup, () => {
            this.player.hit(1);
        });

        this.physics.add.overlap(this.player, this.entryDoor.doorTransitionZone, () => {
            // TODO: Show Text "your adventure just started you can not leave now!"
            console.log('##### ENTRY via zone!');
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

        this.physics.add.collider(this.blockingGroup, this.enemyCollisionTilemap);
        this.physics.add.collider(this.enemyGroup, this.enemyCollisionTilemap);
        this.enemyCollisionTilemap.setCollision(this.enemyCollisionTilemap.tileset[0].firstgid);

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
    }

    // Freeze world except player for ms milliseconds
    freezeWorldExceptPlayer(ms: number) {
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
            });
        }

        // automatically unfreeze after ms
        this.time.delayedCall(ms, () => this.unfreezeWorldExceptPlayer());
    }

    unfreezeWorldExceptPlayer() {
        // restore enemies
        this._freezeState.enemies.forEach((state, enemy) => {
            (enemy as any).active = state.active;
            const body = (enemy as any).body as Phaser.Physics.Arcade.Body | undefined;
            if (body) body.enable = state.bodyEnabled;
            // resume animations if present
            if ((enemy as any).anims) {
                (enemy as any).anims.resume();
            }
        });
        this._freezeState.enemies.clear();
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

        this.freezeWorldExceptPlayer(FREEZE_TIME_ENEMIES_ROOM_TRANSITION);
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
        const buttonObject = this.objectsByRoomId[this.currentRoomId].switches[Number(button.name)];

        console.log('#####** buttonObject', buttonObject);

        buttonObject.buttonPressed();
    }
}
