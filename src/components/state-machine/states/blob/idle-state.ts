import { BLOB_ANIMATION_KEYS } from '../../../../common/assets';
import { DIRECTION_BLOB } from '../../../../common/globals';
import AbstractMovableState from '../../base/abstract-movable-state';
import { BlobStates } from '../states';
import Blob from '../../../../game-objects/enemies/blob';

class IdleBlobState extends AbstractMovableState {
    constructor(gameObject: Blob) {
        super(BlobStates.IDLE, gameObject);
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
                key: BLOB_ANIMATION_KEYS.MOVE_DOWN,
                repeat: -1,
            },
            true,
        );

        this.stateMachine.setState(BlobStates.RUNNING, DIRECTION_BLOB);
    }
}

export default IdleBlobState;
