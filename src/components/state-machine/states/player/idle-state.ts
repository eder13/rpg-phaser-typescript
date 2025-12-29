import { PlayerAnimation } from '../../../../common/assets';
import { DIRECTION } from '../../../../common/globals';
import Player from '../../../../game-objects/player/player';
import BasePlayerState from './base-player-state';
import { PlayerStates } from './player-states';

class IdleState extends BasePlayerState {
    constructor(gameObject: Player) {
        super(PlayerStates.IDLE, gameObject);
    }

    onEnter(args?: unknown[]) {
        this.gameObject.updateVelocity(true, 0);
        this.gameObject.updateVelocity(false, 0);
    }

    onExit() {
        super.onExit();
        // Handle exiting the idle state
    }

    onUpdate(args?: unknown[]) {
        if (!DIRECTION.isMovingDown && !DIRECTION.isMovingUp && !DIRECTION.isMovingLeft && !DIRECTION.isMovingRight) {
            this.gameObject.play(
                {
                    key: PlayerAnimation.IDLE_DOWN,
                    repeat: -1,
                },
                true,
            );
        }

        if (DIRECTION.isMovingDown) {
            DIRECTION.isMovingDown = true;
            DIRECTION.isMovingUp = false;
            DIRECTION.isMovingLeft = false;
            DIRECTION.isMovingRight = false;

            this.gameObject.play(
                {
                    key: PlayerAnimation.IDLE_DOWN,
                    repeat: -1,
                },
                true,
            );
        }

        if (DIRECTION.isMovingUp) {
            DIRECTION.isMovingDown = false;
            DIRECTION.isMovingUp = true;
            DIRECTION.isMovingLeft = false;
            DIRECTION.isMovingRight = false;

            this.gameObject.play(
                {
                    key: PlayerAnimation.IDLE_UP,
                    repeat: -1,
                },
                true,
            );
        }

        if (DIRECTION.isMovingLeft) {
            DIRECTION.isMovingDown = false;
            DIRECTION.isMovingUp = false;
            DIRECTION.isMovingLeft = true;
            DIRECTION.isMovingRight = false;

            this.gameObject.play(
                {
                    key: PlayerAnimation.IDLE_LEFT,
                    repeat: -1,
                },
                true,
            );
        }

        if (DIRECTION.isMovingRight) {
            DIRECTION.isMovingDown = false;
            DIRECTION.isMovingUp = false;
            DIRECTION.isMovingLeft = false;
            DIRECTION.isMovingRight = true;

            this.gameObject.play(
                {
                    key: PlayerAnimation.IDLE_RIGHT,
                    repeat: -1,
                },
                true,
            );
        }

        if (
            !this.gameObject.controls.isDownDown &&
            !this.gameObject.controls.isUpDown &&
            !this.gameObject.controls.isLeftDown &&
            !this.gameObject.controls.isRightDown
        ) {
            return;
        }

        this.stateMachine.setState(PlayerStates.RUNNING, DIRECTION);
    }
}

export default IdleState;
