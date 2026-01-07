import * as Phaser from 'phaser';
import { ChestState, CustomGameObject, Position } from '../../common/types';
import { ASSET_KEYS, CHEST_FRAME_KEYS } from '../../common/assets';
import { CHEST_STATE, INTERACTIVE_OBJECT_TYPE } from '../../common/globals';
import InteractiveObjectComponent from '../../components/game-object/interactive-object-compoent';
import { EVENT_BUS, Events } from '../../common/events';
import { TRAP_TYPE } from '../../common/tiled/common';
import { ChestReward } from '../../common/tiled/types';

type ChestConfig = {
    scene: Phaser.Scene;
    position: Position;
    requireBossKey: boolean;
    id: number;
    revealTrigger: keyof typeof TRAP_TYPE;
    contents: ChestReward;
    chestState?: ChestState;
};

// image because we dont need animations for chests
export class Chest extends Phaser.Physics.Arcade.Image implements CustomGameObject {
    state: ChestState;
    #isBossKeyChest: boolean;
    _interactiveObjectComponent?: InteractiveObjectComponent;
    _revealTrigger: keyof typeof TRAP_TYPE;
    _contents: ChestReward;
    _id: number;

    constructor(config: ChestConfig) {
        const frameKey = config.requireBossKey
            ? CHEST_FRAME_KEYS.BIG_CHEST_CLOSED
            : CHEST_FRAME_KEYS.SMALL_CHEST_CLOSED;
        super(config.scene, config.position.x, config.position.y, ASSET_KEYS.DUNGEON_OBJECTS, frameKey);

        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);
        this.setOrigin(0, 1).setImmovable(true).setDepth(56);

        this._id = config.id;
        this._revealTrigger = config.revealTrigger;
        this.state = config.chestState ?? CHEST_STATE.HIDDEN;
        this.#isBossKeyChest = config.requireBossKey;
        this._contents = config.contents;

        if (this.#isBossKeyChest) {
            this.physicsBody.setSize(32, 24, true).setOffset(0, 8);
        }

        // components
        this._interactiveObjectComponent = new InteractiveObjectComponent(
            this,
            INTERACTIVE_OBJECT_TYPE.OPEN,
            () => {
                if (this.#isBossKeyChest) {
                    // TODO: Make sure the player has the boss key
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
        console.log('+++++ this.open');

        if (this.state !== CHEST_STATE.REVEALED) {
            return;
        }

        this.state = CHEST_STATE.OPEN;
        const frameKey = this.#isBossKeyChest ? CHEST_FRAME_KEYS.BIG_CHEST_OPEN : CHEST_FRAME_KEYS.SMALL_CHEST_OPEN;

        this.setFrame(frameKey);
        this._interactiveObjectComponent = undefined;
    }

    public revealChest(): void {
        console.log('#####** this.revealChest');
        console.log('#####** this.revealChest this.state', this.state);

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
