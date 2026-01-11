import { PlayerAnimation } from '../../../../common/assets';
import { DELAYED_PUSH_BACK_HURT_RESET, DIRECTION } from '../../../../common/globals';
import Player from '../../../../game-objects/player/player';
import AbstractMovableState from '../../base/abstract-movable-state';
import { PlayerStates } from '../states';

class HurtState extends AbstractMovableState {
    hurtPushbackSpeed: number;
    onHurtCallback: () => void;
    nextState: string;

    constructor(
        gameObject: Player,
        hurtPushbackSpeed: number,
        onHurtCallback?: () => void,
        nextState: string = PlayerStates.IDLE,
    ) {
        super(PlayerStates.HURT, gameObject);
        this.hurtPushbackSpeed = hurtPushbackSpeed;
        this.onHurtCallback = onHurtCallback ?? (() => {});
        this.nextState = nextState;
    }

    onEnter(args?: unknown[]) {
        const attackDirection = DIRECTION;
        const body = this.gameObject.body as Phaser.Physics.Arcade.Body;
        body.velocity.x = 0;
        body.velocity.y = 0;

        this.gameObject.scene.sound.play('SFX_PLAYER_HURT', { volume: 0.4 });

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

        const heldGameObjectComponent = (this.gameObject as any).objectHeldComponent;
        if (heldGameObjectComponent && heldGameObjectComponent._object) {
            console.log('[pot] heldGameObjectComponent', heldGameObjectComponent);

            const throwableObjectComponent = heldGameObjectComponent._object.throwableObjectComponent;
            if (throwableObjectComponent !== undefined) {
                console.log('[pot] throwableObjectComponent', throwableObjectComponent);

                throwableObjectComponent?.drop?.();
            }
        }

        if (attackDirection.isMovingUp) {
            body.velocity.y = this.hurtPushbackSpeed;
        } else if (attackDirection.isMovingDown) {
            body.velocity.y = -this.hurtPushbackSpeed;
        } else if (attackDirection.isMovingLeft) {
            body.velocity.x = this.hurtPushbackSpeed;
        } else if (attackDirection.isMovingRight) {
            body.velocity.x = -this.hurtPushbackSpeed;
        } // TODO: Down_right etc. Push back

        // after the push back, wait a certain amount if time before reseting velocity
        this.gameObject.scene.time.delayedCall(DELAYED_PUSH_BACK_HURT_RESET, () => {
            body.velocity.x = 0;
            body.velocity.y = 0;
        });

        this.gameObject.invulnerableComponent.invulnerable = true;
        this.onHurtCallback();

        this.gameObject.setTintFill(0xffffff);

        this.gameObject.scene.time.delayedCall(80, () => {
            this.gameObject.clearTint();
        });

        this.gameObject.play(PlayerAnimation.PLAYER_HURT, true);

        this.gameObject.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
            console.log('Hurt animation finished');
            this.transition();
        });
    }

    transition() {
        this.gameObject.scene.time.delayedCall(DELAYED_PUSH_BACK_HURT_RESET, () => {
            this.gameObject.stateMachine.setState(this.nextState);
        });
        this.gameObject.scene.time.delayedCall(this.gameObject.invulnerableComponent.duration, () => {
            this.gameObject.invulnerableComponent.invulnerable = false;
        });
    }

    onExit() {
        super.onExit();
        // Handle exiting the idle state
    }

    onUpdate(args?: unknown[]) {}
}

export default HurtState;
