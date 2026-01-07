import { SPIKE_ANIMATION_KEYS } from '../../../../common/assets';
import { SpikeStates } from '../states';
import Fire from '../../../../game-objects/objects/fire';
import AbstractStaticState from '../../base/abstract-static-state';

class SpikeIdleState extends AbstractStaticState {
    constructor(gameObject: Fire) {
        super(SpikeStates.IDLE, gameObject);
    }

    onEnter(args?: unknown[]) {
        this.gameObject.play(
            {
                key: SPIKE_ANIMATION_KEYS.IDLE,
                repeat: -1,
            },
            true,
        );
    }

    onExit() {
        super.onExit();
        // Handle exiting the idle state
    }

    onUpdate(args?: unknown[]) {}
}

export default SpikeIdleState;
