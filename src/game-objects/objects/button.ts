import * as Phaser from 'phaser';
import { CustomGameObject } from '../../common/types';
import { ASSET_KEYS, BUTTON_FRAME_KEYS } from '../../common/assets';
import { SwitchAction, TiledSwitchObject } from '../../common/tiled/types';
import { SWITCH_TEXTURE } from '../../common/tiled/common';

export class Button extends Phaser.Physics.Arcade.Image implements CustomGameObject {
    switchTargetIds!: number[];
    switchAction!: SwitchAction;

    constructor(scene: Phaser.Scene, config: TiledSwitchObject) {
        const frame =
            config.texture === SWITCH_TEXTURE.FLOOR ? BUTTON_FRAME_KEYS.FLOOR_SWITCH : BUTTON_FRAME_KEYS.PLATE_SWITCH;
        super(scene, config.x, config.y, ASSET_KEYS.DUNGEON_OBJECTS, frame);
        this.switchTargetIds = config.targetIds;
        this.switchAction = config.action;
        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);
        this.setOrigin(0, 1).setImmovable(true).setDepth(1); // setImmovable wont let the object move once collided with
    }

    public buttonPressed() {
        this.disableObject();

        return {
            targetIds: this.switchTargetIds,
            action: this.switchAction,
        };
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
