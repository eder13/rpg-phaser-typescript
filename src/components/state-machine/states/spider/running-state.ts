import { PlayerAnimation } from '../../../../common/assets';
import Player from '../../../../game-objects/player/player';
import { DIRECTION_SPIDER } from '../../../../common/globals';
import Spider from '../../../../game-objects/enemies/spider';
import BasePlayerState from '../player/base-player-state';
import { SpiderStates } from '../player/player-states';

class RunningStateSpider extends BasePlayerState {
    constructor(gameObject: Spider) {
        super(SpiderStates.RUNNING, gameObject);
    }

    onUpdate(args?: unknown[]) {
        if (
            !this.gameObject.controls.isDownDown &&
            !this.gameObject.controls.isUpDown &&
            !this.gameObject.controls.isLeftDown &&
            !this.gameObject.controls.isRightDown
        ) {
            this.stateMachine.setState(SpiderStates.IDLE);
        }

        if (this.gameObject.controlsComponent.controls.isDownDown) {
            DIRECTION_SPIDER.isMovingDown = true;
            DIRECTION_SPIDER.isMovingUp = false;
            DIRECTION_SPIDER.isMovingLeft = false;
            DIRECTION_SPIDER.isMovingRight = false;

            this.gameObject.updateVelocity(false, 1);

            this.gameObject.setAngle(0);
        } else if (this.gameObject.controlsComponent.controls.isUpDown) {
            DIRECTION_SPIDER.isMovingDown = false;
            DIRECTION_SPIDER.isMovingUp = true;
            DIRECTION_SPIDER.isMovingLeft = false;
            DIRECTION_SPIDER.isMovingRight = false;

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
                DIRECTION_SPIDER.isMovingDown = false;
                DIRECTION_SPIDER.isMovingUp = false;
                DIRECTION_SPIDER.isMovingLeft = true;
                DIRECTION_SPIDER.isMovingRight = false;

                this.gameObject.setAngle(90);
            }

            this.gameObject.updateVelocity(true, -1);
        } else if (this.gameObject.controlsComponent.controls.isRightDown) {
            if (!isMovingvertically) {
                DIRECTION_SPIDER.isMovingDown = false;
                DIRECTION_SPIDER.isMovingUp = false;
                DIRECTION_SPIDER.isMovingLeft = false;
                DIRECTION_SPIDER.isMovingRight = true;

                this.gameObject.setAngle(270);
            }
            this.gameObject.updateVelocity(true, 1);
        } else {
            this.gameObject.updateVelocity(true, 0);
        }
    }
}

export default RunningStateSpider;
