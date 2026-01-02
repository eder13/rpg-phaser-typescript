import { PlayerAnimation } from '../../../../common/assets';
import { DIRECTION } from '../../../../common/globals';
import Player from '../../../../game-objects/player/player';
import BasePlayerState from './base-player-state';
import { PlayerStates } from '../states';

class IdleHoldingState extends BasePlayerState {
    constructor(gameObject: Player) {
        super(PlayerStates.IDLE_HOLDING, gameObject);
    }

    onEnter(args?: unknown[]) {
        if (DIRECTION.isMovingDown) {
            this.gameObject.play(
                {
                    key: PlayerAnimation.PICKUP_DOWN_IDLE,
                    repeat: -1,
                },
                true,
            );
        } else if (DIRECTION.isMovingUp) {
            this.gameObject.play(
                {
                    key: PlayerAnimation.PICKUP_UP_IDLE,
                    repeat: -1,
                },
                true,
            );
        } else if (DIRECTION.isMovingLeft) {
            this.gameObject.play(
                {
                    key: PlayerAnimation.PICKUP_LEFT_IDLE,
                    repeat: -1,
                },
                true,
            );
        } else if (DIRECTION.isMovingRight) {
            this.gameObject.play(
                {
                    key: PlayerAnimation.PICKUP_RIGHT_IDLE,
                    repeat: -1,
                },
                true,
            );
        }
    }

    onExit() {
        super.onExit();
        // Handle exiting the idle state
    }

    onUpdate(args?: unknown[]) {
        /*  if (
            !this.gameObject.controls.isDownDown &&
            !this.gameObject.controls.isUpDown &&
            !this.gameObject.controls.isLeftDown &&
            !this.gameObject.controls.isRightDown
        ) {
            return;
        } */

        if (this.gameObject.controls.isActionKeyDown) {
            this.gameObject.stateMachine.setState(PlayerStates.THROW);
            return;
        }

        this.stateMachine.setState(PlayerStates.MOVING_HOLDING, DIRECTION);
    }
}

export default IdleHoldingState;
