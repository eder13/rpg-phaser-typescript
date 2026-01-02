import { PlayerAnimation, SPIDER_ANIMATION_KEYS } from '../../../../common/assets';
import { DELAYED_PUSH_BACK_HURT_RESET, DIRECTION } from '../../../../common/globals';
import { PlayerStates, SpiderStates } from '../states';
import Spider from '../../../../game-objects/enemies/spider';
import BasePlayerState from '../player/base-player-state';

class HurtStateSpider extends BasePlayerState {
    hurtPushbackSpeed: number;
    onHurtCallback: () => void;
    nextState: string;

    constructor(
        gameObject: Spider,
        hurtPushbackSpeed: number,
        onHurtCallback?: () => void,
        nextState: string = SpiderStates.RUNNING,
    ) {
        super(SpiderStates.HURT, gameObject);
        this.hurtPushbackSpeed = hurtPushbackSpeed;
        this.onHurtCallback = onHurtCallback ?? (() => {});
        this.nextState = nextState;
    }

    onEnter(args?: unknown[]) {
        const attackDirection = DIRECTION;
        const body = this.gameObject.body as Phaser.Physics.Arcade.Body;
        body.velocity.x = 0;
        body.velocity.y = 0;

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

        this.gameObject.play(SPIDER_ANIMATION_KEYS.HIT, true);

        this.gameObject.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
            console.log('Hurt animation of Spider finished');
            this.transition();
        });
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

export default HurtStateSpider;
