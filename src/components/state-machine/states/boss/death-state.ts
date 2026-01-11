import { BLOB_ANIMATION_KEYS, BOSS_ANIMATION_KEYS } from '../../../../common/assets';
import { DELAYED_PUSH_BACK_HURT_RESET } from '../../../../common/globals';
import AbstractMovableState from '../../base/abstract-movable-state';
import { BlobStates, BossStates } from '../states';
import Blob from '../../../../game-objects/enemies/blob';
import { EVENT_BUS, Events } from '../../../../common/events';
import Boss from '../../../../game-objects/enemies/boss';
import DeathStateBlob from '../blob/death-state';

class DeathStateBoss extends AbstractMovableState {
    onDieCallback: () => void;

    constructor(gameObject: Boss, onDieCallback: () => void) {
        super(BossStates.DEATH, gameObject);
        this.onDieCallback = onDieCallback;
    }

    onEnter(args?: unknown[]) {
        (this.gameObject.body as Phaser.Physics.Arcade.Body).enable = false;

        this.gameObject.updateVelocity(true, 0);
        this.gameObject.updateVelocity(false, 0);

        this.gameObject.invulnerableComponent.invulnerable = true;

        this.gameObject.scene.sound.play('SFX_ENEMY_DEAD', { volume: 0.4 });

        this.gameObject.play({
            key: BOSS_ANIMATION_KEYS.DEATH,
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

        console.log('[boss] Emitting BOSS_DEFEATED event');
        EVENT_BUS.emit(Events.BOSS_DEFEATED, this.gameObject);
    }

    onUpdate(args?: unknown[]) {}
}

export default DeathStateBoss;
