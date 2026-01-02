import { PlayerAnimation } from '../../../../common/assets';
import { DIRECTION } from '../../../../common/globals';
import Player from '../../../../game-objects/player/player';
import BasePlayerState from './base-player-state';
import { PlayerStates } from '../states';

class DeathStatePlayer extends BasePlayerState {
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
    }

    onUpdate(args?: unknown[]) {}
}

export default DeathStatePlayer;
