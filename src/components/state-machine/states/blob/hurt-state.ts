import { DELAYED_PUSH_BACK_HURT_RESET, DIRECTION } from '../../../../common/globals';
import { BlobStates } from '../states';
import AbstractMovableState from '../../base/abstract-movable-state';
import Blob from '../../../../game-objects/enemies/blob';

class HurtStateBlob extends AbstractMovableState {
    hurtPushbackSpeed: number;
    onHurtCallback: () => void;
    nextState: string;

    constructor(
        gameObject: Blob,
        hurtPushbackSpeed: number,
        onHurtCallback?: () => void,
        nextState: string = BlobStates.RUNNING,
    ) {
        super(BlobStates.HURT, gameObject);
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

export default HurtStateBlob;
