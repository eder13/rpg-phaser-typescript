import { PlayerAnimation, SPIDER_ANIMATION_KEYS } from '../../../../common/assets';
import { ATTACK_DIRECTION, DELAYED_PUSH_BACK_HURT_RESET, DIRECTION } from '../../../../common/globals';
import AbstractMovableState from '../../base/abstract-movable-state';
import { Direction, DIRECTION as DIRECTION_HIT } from '../../../../common/tiled/types';
import Boss from '../../../../game-objects/enemies/boss';
import { BossStates } from '../states';

class HurtStateBoss extends AbstractMovableState {
    hurtPushbackSpeed: number;
    onHurtCallback: () => void;
    nextState: string;

    constructor(
        gameObject: Boss,
        hurtPushbackSpeed: number,
        onHurtCallback?: () => void,
        nextState: string = BossStates.RANDOM,
    ) {
        super(BossStates.HURT, gameObject);
        this.hurtPushbackSpeed = hurtPushbackSpeed;
        this.onHurtCallback = onHurtCallback ?? (() => {});
        this.nextState = nextState;
    }

    onEnter(args?: unknown[]) {
        const hitDirection = args?.[0] as typeof ATTACK_DIRECTION | undefined;
        console.log('[HurtStateBoss] onEnter hitDirection:', hitDirection);

        const body = this.gameObject.body as Phaser.Physics.Arcade.Body;
        body.velocity.x = 0;
        body.velocity.y = 0;

        this.gameObject.scene.sound.play('SFX_ENEMY_HURT', { volume: 0.4 });

        if (hitDirection) {
            // player used sword against enemy
            if (hitDirection.UP) {
                body.velocity.y = -this.hurtPushbackSpeed;
            } else if (hitDirection.DOWN) {
                body.velocity.y = this.hurtPushbackSpeed;
            } else if (hitDirection.LEFT) {
                body.velocity.x = -this.hurtPushbackSpeed;
            } else if (hitDirection.RIGHT) {
                body.velocity.x = this.hurtPushbackSpeed;
            }
        } else {
            // player ran into enemy
            const attackDirection = DIRECTION;

            if (attackDirection.isMovingUp) {
                body.velocity.y = this.hurtPushbackSpeed;
            } else if (attackDirection.isMovingDown) {
                body.velocity.y = -this.hurtPushbackSpeed;
            } else if (attackDirection.isMovingLeft) {
                body.velocity.x = this.hurtPushbackSpeed;
            } else if (attackDirection.isMovingRight) {
                body.velocity.x = -this.hurtPushbackSpeed;
            }
        }

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

        this.transition();
    }

    transition() {
        this.gameObject.scene.time.delayedCall(DELAYED_PUSH_BACK_HURT_RESET, () => {
            this.gameObject.invulnerableComponent.invulnerable = false;
            this.gameObject.stateMachine.setState(this.nextState);
        });
    }

    onExit() {
        super.onExit();
        // Handle exiting the idle state
    }

    onUpdate(args?: unknown[]) {}
}

export default HurtStateBoss;
