import { PlayerAnimation, SAW_ANIMATION_KEYS } from '../../../../common/assets';
import { DIRECTION, SPEED_SAW_BOUNCE } from '../../../../common/globals';
import Saw from '../../../../game-objects/enemies/saw';
import Player from '../../../../game-objects/player/player';
import BasePlayerState from '../player/base-player-state';
import { SawStates } from '../player/player-states';

class BounceMoveState extends BasePlayerState {
    constructor(gameObject: Saw) {
        super(SawStates.BOUNCE_MOVE, gameObject);
    }

    onEnter(args?: unknown[]) {
        const randomDirection = Phaser.Math.Between(0, 3);

        if (randomDirection === 0) {
            this.gameObject?.setVelocity?.(SPEED_SAW_BOUNCE, SPEED_SAW_BOUNCE * -1);
        } else if (randomDirection === 1) {
            this.gameObject.setVelocity(SPEED_SAW_BOUNCE, SPEED_SAW_BOUNCE);
        } else if (randomDirection === 2) {
            this.gameObject.setVelocity(SPEED_SAW_BOUNCE * -1, SPEED_SAW_BOUNCE);
        } else if (randomDirection === 3) {
            this.gameObject.setVelocity(SPEED_SAW_BOUNCE, SPEED_SAW_BOUNCE * -1);
        }

        this.gameObject.setBounce(1);
    }

    onUpdate(): void {
        this.gameObject.play(
            {
                key: SAW_ANIMATION_KEYS.WALK,
                repeat: -1,
            },
            true,
        );
    }

    onExit() {
        super.onExit();
        // Handle exiting the bounce move state
    }
}

export default BounceMoveState;
