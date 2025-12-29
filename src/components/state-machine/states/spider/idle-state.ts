import { SPIDER_ANIMATION_KEYS } from '../../../../common/assets';
import { DIRECTION_SPIDER } from '../../../../common/globals';
import Spider from '../../../../game-objects/enemies/spider';
import BasePlayerState from '../player/base-player-state';
import { SpiderStates } from '../player/player-states';

class IdleStateSpider extends BasePlayerState {
    constructor(gameObject: Spider) {
        super(SpiderStates.IDLE, gameObject);
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
        this.gameObject.play(
            {
                key: SPIDER_ANIMATION_KEYS.WALK,
                repeat: -1,
            },
            true,
        );

        this.stateMachine.setState(SpiderStates.RUNNING, DIRECTION_SPIDER);
    }
}

export default IdleStateSpider;
