import { PlayerAnimation } from '../../../../common/assets';
import { EVENT_BUS, Events } from '../../../../common/events';
import { DIRECTION } from '../../../../common/globals';
import Player from '../../../../game-objects/player/player';
import AbstractMovableState from '../../base/abstract-movable-state';
import { PlayerStates } from '../states';

class DeathStatePlayer extends AbstractMovableState {
    onDieCallback: () => void;

    constructor(gameObject: Player, onDieCallback: () => void) {
        super(PlayerStates.DEATH, gameObject);
        this.onDieCallback = onDieCallback;
    }

    onEnter(args?: unknown[]) {
        this.gameObject.updateVelocity(true, 0);
        this.gameObject.updateVelocity(false, 0);

        const heldGameObjectComponent = (this.gameObject as any).objectHeldComponent;
        if (heldGameObjectComponent && heldGameObjectComponent._object) {
            const throwableObjectComponent = heldGameObjectComponent._object.throwableObjectComponent;
            if (throwableObjectComponent !== undefined) {
                throwableObjectComponent?.drop?.();
            }
        }

        this.gameObject.invulnerableComponent.invulnerable = true;

        this.gameObject.scene.sound.play('SFX_ENEMY_DEAD', { volume: 0.4 });

        // hack, somehow [pot] break sounds are not stopped
        this.gameObject.scene.time.delayedCall(50, () => {
            const mgr = this.gameObject.scene.sound as Phaser.Sound.BaseSoundManager;
            // @ts-ignore
            mgr.sounds.forEach((s: Phaser.Sound.BaseSound) => {
                if (!s.key) return;
                if (s.key.includes('POT') || s.key.includes('SFX_POT')) {
                    console.log('##### [pot] foreach', s);

                    if (s.isPlaying) s.stop();
                }
            });
        });

        this.gameObject.play({
            key: PlayerAnimation.PLAYER_DEATH,
            repeat: 0,
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
        (this.gameObject as Player).disableObject();
        this.onDieCallback();
        EVENT_BUS.emit(Events.PLAYER_DEFEATED, this.gameObject);
    }

    onUpdate(args?: unknown[]) {}
}

export default DeathStatePlayer;
