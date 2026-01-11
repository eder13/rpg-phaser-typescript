import { SPIKE_ANIMATION_KEYS } from '../../../../common/assets';
import { SpikeStates } from '../states';
import Fire from '../../../../game-objects/objects/fire';
import AbstractStaticState from '../../base/abstract-static-state';

class SpikeIdleState extends AbstractStaticState {
    private lastStepTime = 0;
    private stepInterval = 700; // ms, anpassen (z.B. 250..400)

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

    onUpdate(args?: unknown[]) {
        const now = this.gameObject.scene.time.now;

        // sound workaround, spikes are only in room 7
        const currentRoom = (this.gameObject.scene as any).currentRoomWithId;
        if (currentRoom === 7) {
            if (now - this.lastStepTime >= this.stepInterval) {
                if (this.gameObject.scene.cache.audio.exists('SFX_SPIKE_TRAP')) {
                    this.gameObject.scene.sound.play('SFX_SPIKE_TRAP', { volume: 0.005 });
                    this.lastStepTime = now;
                }
            }
        }
    }
}

export default SpikeIdleState;
