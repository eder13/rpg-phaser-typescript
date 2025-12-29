import { PlayerAnimation } from '../../../../common/assets';
import Player from '../../../../game-objects/player/player';
import BasePlayerState from './base-player-state';
import { PlayerStates } from './player-states';
import { DIRECTION } from '../../../../common/globals';

class RunningState extends BasePlayerState {
    constructor(gameObject: Player) {
        super(PlayerStates.RUNNING, gameObject);
    }

    onUpdate(args?: unknown[]) {
        if (
            !this.gameObject.controls.isDownDown &&
            !this.gameObject.controls.isUpDown &&
            !this.gameObject.controls.isLeftDown &&
            !this.gameObject.controls.isRightDown
        ) {
            this.stateMachine.setState(PlayerStates.IDLE);
        }

        if (this.gameObject.controlsComponent.controls.isDownDown) {
            DIRECTION.isMovingDown = true;
            DIRECTION.isMovingUp = false;
            DIRECTION.isMovingLeft = false;
            DIRECTION.isMovingRight = false;

            this.gameObject;

            this.gameObject.play(
                {
                    key: PlayerAnimation.WALKING_DOWN,
                    repeat: -1,
                },
                true,
            );
            this.gameObject.updateVelocity(false, 1);
        } else if (this.gameObject.controlsComponent.controls.isUpDown) {
            DIRECTION.isMovingDown = false;
            DIRECTION.isMovingUp = true;
            DIRECTION.isMovingLeft = false;
            DIRECTION.isMovingRight = false;

            this.gameObject.play(
                {
                    key: PlayerAnimation.WALKING_UP,
                    repeat: -1,
                },
                true,
            );
            this.gameObject.updateVelocity(false, -1);
        } else {
            this.gameObject.updateVelocity(false, 0);
        }

        const isMovingvertically =
            this.gameObject.controlsComponent.controls.isUpDown ||
            this.gameObject.controlsComponent.controls.isDownDown;

        if (this.gameObject.controlsComponent.controls.isLeftDown) {
            if (!isMovingvertically) {
                DIRECTION.isMovingDown = false;
                DIRECTION.isMovingUp = false;
                DIRECTION.isMovingLeft = true;
                DIRECTION.isMovingRight = false;

                this.gameObject.play(
                    {
                        key: PlayerAnimation.WALKING_LEFT,
                        repeat: -1,
                    },
                    true,
                );
            }

            this.gameObject.updateVelocity(true, -1);
        } else if (this.gameObject.controlsComponent.controls.isRightDown) {
            if (!isMovingvertically) {
                DIRECTION.isMovingDown = false;
                DIRECTION.isMovingUp = false;
                DIRECTION.isMovingLeft = false;
                DIRECTION.isMovingRight = true;

                this.gameObject.play(
                    {
                        key: PlayerAnimation.WALKING_RIGHT,
                        repeat: -1,
                    },
                    true,
                );
            }
            this.gameObject.updateVelocity(true, 1);
        } else {
            this.gameObject.updateVelocity(true, 0);
        }
    }
}

export default RunningState;
