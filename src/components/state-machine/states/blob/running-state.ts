import { BLOB_ANIMATION_KEYS, PlayerAnimation } from '../../../../common/assets';
import Player from '../../../../game-objects/player/player';
import { DIRECTION_BLOB, DIRECTION_SPIDER } from '../../../../common/globals';
import Spider from '../../../../game-objects/enemies/spider';
import AbstractMovableState from '../../base/abstract-movable-state';
import { BlobStates, SpiderStates } from '../states';
import Blob from '../../../../game-objects/enemies/blob';

class RunningStateBlob extends AbstractMovableState {
    constructor(gameObject: Blob) {
        super(BlobStates.RUNNING, gameObject);
    }

    onUpdate(args?: unknown[]) {
        if (
            !this.gameObject.controls.isDownDown &&
            !this.gameObject.controls.isUpDown &&
            !this.gameObject.controls.isLeftDown &&
            !this.gameObject.controls.isRightDown
        ) {
            this.stateMachine.setState(BlobStates.IDLE);
        }

        if (this.gameObject.controlsComponent.controls.isDownDown) {
            this.gameObject.anims.play({
                key: BLOB_ANIMATION_KEYS.MOVE_DOWN,
                repeat: -1,
            });

            DIRECTION_BLOB.isMovingDown = true;
            DIRECTION_BLOB.isMovingUp = false;
            DIRECTION_BLOB.isMovingLeft = false;
            DIRECTION_BLOB.isMovingRight = false;

            this.gameObject.updateVelocity(false, 1);

            this.gameObject.setAngle(0);
        } else if (this.gameObject.controlsComponent.controls.isUpDown) {
            this.gameObject.anims.play({
                key: BLOB_ANIMATION_KEYS.MOVE_UP,
                repeat: -1,
            });

            DIRECTION_BLOB.isMovingDown = false;
            DIRECTION_BLOB.isMovingUp = true;
            DIRECTION_BLOB.isMovingLeft = false;
            DIRECTION_BLOB.isMovingRight = false;

            this.gameObject.setAngle(180);

            this.gameObject.updateVelocity(false, -1);
        } else {
            this.gameObject.updateVelocity(false, 0);
        }

        const isMovingvertically =
            this.gameObject.controlsComponent.controls.isUpDown ||
            this.gameObject.controlsComponent.controls.isDownDown;

        if (this.gameObject.controlsComponent.controls.isLeftDown) {
            if (!isMovingvertically) {
                this.gameObject.anims.play({
                    key: BLOB_ANIMATION_KEYS.MOVE_LEFT,
                    repeat: -1,
                });

                DIRECTION_BLOB.isMovingDown = false;
                DIRECTION_BLOB.isMovingUp = false;
                DIRECTION_BLOB.isMovingLeft = true;
                DIRECTION_BLOB.isMovingRight = false;

                this.gameObject.setAngle(90);
            }

            this.gameObject.updateVelocity(true, -1);
        } else if (this.gameObject.controlsComponent.controls.isRightDown) {
            this.gameObject.anims.play({
                key: BLOB_ANIMATION_KEYS.MOVE_RIGHT,
                repeat: -1,
            });

            if (!isMovingvertically) {
                DIRECTION_BLOB.isMovingDown = false;
                DIRECTION_BLOB.isMovingUp = false;
                DIRECTION_BLOB.isMovingLeft = false;
                DIRECTION_BLOB.isMovingRight = true;

                this.gameObject.setAngle(270);
            }
            this.gameObject.updateVelocity(true, 1);
        } else {
            this.gameObject.updateVelocity(true, 0);
        }
    }
}

export default RunningStateBlob;
