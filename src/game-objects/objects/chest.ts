import * as Phaser from 'phaser';
import { ChestState, CustomGameObject, Position } from '../../common/types';
import { ASSET_KEYS, CHEST_FRAME_KEYS } from '../../common/assets';
import {
    CHEST_STATE,
    DELAY_BEFORE_ITEM_REVEALED_MOVE_UP,
    DELAY_BEFORE_ITEM_STOP,
    DURATION_FREEZE_SHOW_ITEM_REVEALED_CHEST,
    INTERACTIVE_OBJECT_TYPE,
} from '../../common/globals';
import InteractiveObjectComponent from '../../components/game-object/interactive-object-compoent';
import { EVENT_BUS, Events } from '../../common/events';
import { CHEST_REWARD, TRAP_TYPE } from '../../common/tiled/common';
import { ChestReward } from '../../common/tiled/types';
import InventoryManager from '../../components/inventory/inventory';

type ChestConfig = {
    scene: Phaser.Scene;
    position: Position;
    requireBossKey: boolean;
    id: number;
    revealTrigger: keyof typeof TRAP_TYPE;
    contents: ChestReward;
    chestState?: ChestState;
};

export class Chest extends Phaser.Physics.Arcade.Image implements CustomGameObject {
    state: ChestState;
    #isBossKeyChest: boolean;
    _interactiveObjectComponent?: InteractiveObjectComponent;
    _revealTrigger: keyof typeof TRAP_TYPE;
    _contents: ChestReward;
    _id: number;
    _rewardObject: Phaser.Physics.Arcade.Image | undefined;

    constructor(config: ChestConfig) {
        const frameKey = config.requireBossKey
            ? CHEST_FRAME_KEYS.BIG_CHEST_CLOSED
            : CHEST_FRAME_KEYS.SMALL_CHEST_CLOSED;
        super(config.scene, config.position.x, config.position.y, ASSET_KEYS.DUNGEON_OBJECTS, frameKey);

        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);
        this.setOrigin(0, 1).setImmovable(true).setDepth(2);

        this._id = config.id;
        this._revealTrigger = config.revealTrigger;
        this.state = config.chestState ?? CHEST_STATE.HIDDEN;
        this.#isBossKeyChest = config.requireBossKey;
        this._contents = config.contents;

        if (this.#isBossKeyChest) {
            this.physicsBody.setSize(32, 24, true).setOffset(0, 8);
        }

        this._interactiveObjectComponent = new InteractiveObjectComponent(
            this,
            INTERACTIVE_OBJECT_TYPE.OPEN,
            () => {
                if (this.#isBossKeyChest) {
                    return true;
                }

                return true;
            },
            () => {
                this.open();
            },
        );

        if (this._revealTrigger === TRAP_TYPE.NONE) {
            if (this.state === CHEST_STATE.HIDDEN) {
                this.state = CHEST_STATE.REVEALED;
            }
            return;
        }

        this.disableObject();
    }

    get physicsBody(): Phaser.Physics.Arcade.Body {
        return this.body as Phaser.Physics.Arcade.Body;
    }

    get revealTrigger(): keyof typeof TRAP_TYPE {
        return this._revealTrigger;
    }

    get contents(): ChestReward {
        return this._contents;
    }

    get id(): number {
        return this._id;
    }

    public open(): void {
        if (this.state !== CHEST_STATE.REVEALED) {
            return;
        }

        (this.scene as any).freezeWorldWithPlayer(DURATION_FREEZE_SHOW_ITEM_REVEALED_CHEST);
        this.scene.sound.play('SFX_TADA_CHEST', { volume: 0.4, seek: 0.0 });

        if (this._contents === CHEST_REWARD.NOTHING) {
            this._rewardObject = undefined;

            EVENT_BUS.emit(Events.SHOW_DIALOG, '...The chest was empty!');
        } else {
            this._rewardObject = this.scene.physics.add
                .image(
                    this.x + this.width / 2,
                    this.y - 20,
                    this.contents === CHEST_REWARD.SMALL_KEY ? ASSET_KEYS.SMALL_KEY : ASSET_KEYS.BOSS_KEY,
                    0,
                )
                .setImmovable(true)
                .setDepth(4)
                .setName(`${this.id.toString(10)}-reward-small-key`);

            this.scene.time.delayedCall(DELAY_BEFORE_ITEM_REVEALED_MOVE_UP, () => {
                if (this._rewardObject?.body) {
                    this._rewardObject.body.velocity.set(0, -100);
                }

                this.scene.time.delayedCall(DELAY_BEFORE_ITEM_STOP, () => {
                    if (this._rewardObject?.body) {
                        this._rewardObject.body.velocity.set(0, 0);
                    }
                });
            });

            this.scene.time.delayedCall(DURATION_FREEZE_SHOW_ITEM_REVEALED_CHEST, () => {
                if (this._rewardObject?.body) {
                    (this._rewardObject.body as Phaser.Physics.Arcade.Body).enable = false;
                    this._rewardObject.visible = false;
                    this._rewardObject.active = false;
                }
            });

            InventoryManager.getInstance().addKey(this.contents === CHEST_REWARD.SMALL_KEY ? 'standard' : 'boss');

            EVENT_BUS.emit(
                Events.SHOW_DIALOG,
                this.contents === CHEST_REWARD.SMALL_KEY ? 'You found a small key!' : 'You found the boss key!',
            );
        }

        this.scene.time.delayedCall(DURATION_FREEZE_SHOW_ITEM_REVEALED_CHEST, () => {
            EVENT_BUS.emit(Events.HIDE_DIALOG);
        });

        this.state = CHEST_STATE.OPEN;
        const frameKey = this.#isBossKeyChest ? CHEST_FRAME_KEYS.BIG_CHEST_OPEN : CHEST_FRAME_KEYS.SMALL_CHEST_OPEN;

        this.setFrame(frameKey);
        this._interactiveObjectComponent = undefined;
    }

    public revealChest(): void {
        if (this.state !== CHEST_STATE.HIDDEN) {
            return;
        }

        this.state = CHEST_STATE.REVEALED;
        this.enableObject();
    }

    public disableObject() {
        (this.body as Phaser.Physics.Arcade.Body).enable = false;
        this.visible = false;
        this.active = false;
    }

    public enableObject() {
        (this.body as Phaser.Physics.Arcade.Body).enable = true;
        this.visible = true;
        this.active = true;
    }
}
