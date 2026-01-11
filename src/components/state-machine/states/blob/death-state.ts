import { BLOB_ANIMATION_KEYS } from '../../../../common/assets';
import { DELAYED_PUSH_BACK_HURT_RESET } from '../../../../common/globals';
import AbstractMovableState from '../../base/abstract-movable-state';
import { BlobStates } from '../states';
import Blob from '../../../../game-objects/enemies/blob';
import { EVENT_BUS, Events } from '../../../../common/events';

class DeathStateBlob extends AbstractMovableState {
    onDieCallback: () => void;

    constructor(gameObject: Blob, onDieCallback: () => void) {
        super(BlobStates.DEATH, gameObject);
        this.onDieCallback = onDieCallback;
    }

    onEnter(args?: unknown[]) {
        (this.gameObject.body as Phaser.Physics.Arcade.Body).enable = false;

        this.gameObject.updateVelocity(true, 0);
        this.gameObject.updateVelocity(false, 0);

        this.gameObject.invulnerableComponent.invulnerable = true;

        this.gameObject.scene.sound.play('SFX_ENEMY_DEAD', { volume: 0.4 });

        this.gameObject.play({
            key: BLOB_ANIMATION_KEYS.DEATH,
            repeat: 0,
        });

        // after the push back, wait a certain amount if time before reseting velocity
        this.gameObject.scene.time.delayedCall(DELAYED_PUSH_BACK_HURT_RESET, () => {
            if (this.gameObject.body) {
                this.gameObject.body.velocity.x = 0;
                this.gameObject.body.velocity.y = 0;
            }
        });

        this.gameObject.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
            console.log('Die Animation is done');
            this.onDefeat();
        });
    }

    onExit() {
        super.onExit();
        // Handle exiting the idle state
    }

    onDefeat() {
        (this.gameObject as Blob).disableObject();
        this.onDieCallback();

        EVENT_BUS.emit(Events.ENEMY_DEFEATED, this.gameObject);
    }

    onUpdate(args?: unknown[]) {}
}

export default DeathStateBlob;
