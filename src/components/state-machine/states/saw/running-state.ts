import { SAW_ANIMATION_KEYS, SPIDER_ANIMATION_KEYS } from '../../../../common/assets';
import { DIRECTION_SAW } from '../../../../common/globals';
import Saw from '../../../../game-objects/enemies/saw';
import Spider from '../../../../game-objects/enemies/spider';
import BasePlayerState from '../player/base-player-state';
import { SawStates, SpiderStates } from '../player/player-states';

class RunningStateSaw extends BasePlayerState {
    constructor(gameObject: Saw) {
        super(SawStates.RUNNING, gameObject);
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
        this.stateMachine.setState(SawStates.RUNNING, DIRECTION_SAW);

        this.gameObject.play(
            {
                key: SAW_ANIMATION_KEYS.WALK,
                repeat: -1,
            },
            true,
        );

        if (this.gameObject.controlsComponent.controls.isDownDown) {
            DIRECTION_SAW.isMovingDown = true;
            DIRECTION_SAW.isMovingUp = false;
            DIRECTION_SAW.isMovingLeft = false;
            DIRECTION_SAW.isMovingRight = false;

            this.gameObject.updateVelocity(false, 1);
        } else if (this.gameObject.controlsComponent.controls.isUpDown) {
            DIRECTION_SAW.isMovingDown = false;
            DIRECTION_SAW.isMovingUp = true;
            DIRECTION_SAW.isMovingLeft = false;
            DIRECTION_SAW.isMovingRight = false;

            this.gameObject.updateVelocity(false, -1);
        } else {
            this.gameObject.updateVelocity(false, 0);
        }

        const isMovingvertically =
            this.gameObject.controlsComponent.controls.isUpDown ||
            this.gameObject.controlsComponent.controls.isDownDown;

        if (this.gameObject.controlsComponent.controls.isLeftDown) {
            if (!isMovingvertically) {
                DIRECTION_SAW.isMovingDown = false;
                DIRECTION_SAW.isMovingUp = false;
                DIRECTION_SAW.isMovingLeft = true;
                DIRECTION_SAW.isMovingRight = false;
            }

            this.gameObject.updateVelocity(true, -1);
        } else if (this.gameObject.controlsComponent.controls.isRightDown) {
            if (!isMovingvertically) {
                DIRECTION_SAW.isMovingDown = false;
                DIRECTION_SAW.isMovingUp = false;
                DIRECTION_SAW.isMovingLeft = false;
                DIRECTION_SAW.isMovingRight = true;
            }
            this.gameObject.updateVelocity(true, 1);
        } else {
            this.gameObject.updateVelocity(true, 0);
        }
    }
}

export default RunningStateSaw;
