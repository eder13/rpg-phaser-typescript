import * as Phaser from 'phaser';
import { ChestState, Position } from '../../common/types';
import { ASSET_KEYS, CHEST_FRAME_KEYS } from '../../common/assets';
import { CHEST_STATE, INTERACTIVE_OBJECT_TYPE } from '../../common/globals';
import InteractiveObjectComponent from '../../components/game-object/interactive-object-compoent';
import { EVENT_BUS, Events } from '../../common/events';

type ChestConfig = {
    scene: Phaser.Scene;
    position: Position;
    requireBossKey: boolean;
    chestState: ChestState;
};

// image because we dont need animations for chests
export class Chest extends Phaser.Physics.Arcade.Image {
    state: ChestState;
    #isBossKeyChest: boolean;
    _interactiveObjectComponent?: InteractiveObjectComponent;

    constructor(config: ChestConfig) {
        const frameKey = config.requireBossKey
            ? CHEST_FRAME_KEYS.BIG_CHEST_CLOSED
            : CHEST_FRAME_KEYS.SMALL_CHEST_CLOSED;
        super(config.scene, config.position.x, config.position.y, ASSET_KEYS.DUNGEON_OBJECTS, frameKey);

        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);
        this.setOrigin(0, 1).setImmovable(true);

        this.state = config.chestState ?? CHEST_STATE.REVEALED;
        this.#isBossKeyChest = config.requireBossKey;

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
    }

    get physicsBody(): Phaser.Physics.Arcade.Body {
        return this.body as Phaser.Physics.Arcade.Body;
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
}
