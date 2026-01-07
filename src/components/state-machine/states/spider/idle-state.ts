import { SPIDER_ANIMATION_KEYS, SPIDER_RED_ANIMATION_KEYS } from '../../../../common/assets';
import { DIRECTION_SPIDER } from '../../../../common/globals';
import Spider from '../../../../game-objects/enemies/spider';
import AbstractMovableState from '../../base/abstract-movable-state';
import { SpiderStates } from '../states';

class IdleStateSpider extends AbstractMovableState {
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
                key: SPIDER_RED_ANIMATION_KEYS.IDLE_DOWN,
                repeat: -1,
            },
            true,
        );

        this.stateMachine.setState(SpiderStates.RUNNING, DIRECTION_SPIDER);
    }
}

export default IdleStateSpider;
