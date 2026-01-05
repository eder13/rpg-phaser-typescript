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
    PLAYER_HEALTH,
    PLAYER_INVULNERABLE_DURATION,
    SAW_INVULNERABLE_DURATION,
    SPIDER_HEALTH,
} from '../common/globals';
import { Pot } from '../game-objects/objects/pot';
import { Chest } from '../game-objects/objects/chest';
import { GameObject } from '../common/types';
import { EVENT_BUS, Events } from '../common/events';
import Fire from '../game-objects/objects/fire';

export class GameScene extends Phaser.Scene {
    player!: Player;
    controls!: InputComponent;
    enemyGroup!: Phaser.GameObjects.Group;
    blockingGroup!: Phaser.GameObjects.Group;
    fpsText!: HTMLElement | null;
    private lastFpsUpdate = 0;

    constructor() {
        super({
            key: SCENE_KEYS.GAME_SCENE,
        });
    }

    private initZoom() {
        const dpr = window.devicePixelRatio || 1;
        console.log('#####** dpr', dpr);

        // base zoom
        let zoom = 1;

        // boost zoom on retina
        /* if (dpr >= 2) {
            zoom = 2;
        } */

        this.cameras.main.setZoom(zoom);
    }

    public create(): void {
        this.fpsText = document.getElementById('fps');

        this.initZoom();

        if (!this.input.keyboard) {
            Logger.error('Keyboard is not enabled!');
            return;
        }

        this.controls = new KeyboardInput(this.input.keyboard);

        this.player = new Player({
            scene: this,
            position: {
                x: this.scale.width / 2,
                y: this.scale.height / 2,
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
                        x: this.scale.width / 2,
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
    }

    update(time: number, delta: number): void {
        // throttle FPS DOM update to reduce work (update ~4x/sec)
        if (this.fpsText && time - this.lastFpsUpdate > 250) {
            this.fpsText.innerHTML = `${Math.floor(this.game.loop.actualFps)}`;
            this.lastFpsUpdate = time;
        }
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
