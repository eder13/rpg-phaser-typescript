import { PlayerAnimation } from '../../../../common/assets';
import { DIRECTION } from '../../../../common/globals';
import Player from '../../../../game-objects/player/player';
import BasePlayerState from './base-player-state';
import { PlayerStates } from '../states';
import { GameObject } from '../../../../common/types';

class LiftState extends BasePlayerState {
    constructor(gameObject: Player) {
        super(PlayerStates.LIFT, gameObject);
    }

    onEnter(args?: unknown[]) {
        const gameObjectPickedUp = args?.[0] as GameObject | undefined;

        console.log('[LiftState] enter', { time: Date.now(), player: this.gameObject, instanceofPlayer: this.gameObject instanceof Player });
        console.log('[LiftState] setting held object ->', gameObjectPickedUp);

        this.gameObject.updateVelocity(true, 0);
        this.gameObject.updateVelocity(false, 0);

        const heldGameObjectComponent = (this.gameObject as any).objectHeldComponent;
        if (!heldGameObjectComponent) {
            this.stateMachine.setState(PlayerStates.IDLE);
            return;
        }
        heldGameObjectComponent._object = gameObjectPickedUp;
        (this.gameObject as any).objectHeldComponent._object = heldGameObjectComponent._object;

        console.log('[LiftState] after set held._object =', (this.gameObject as any).objectHeldComponent._object);

        if (gameObjectPickedUp?.body) {
            const body = gameObjectPickedUp.body as Phaser.Physics.Arcade.Body;
            body.enable = false;
        }
        gameObjectPickedUp?.setDepth(2).setOrigin(0.5, 0.5);

        if (DIRECTION.isMovingDown) {
            this.gameObject.play(
                {
                    key: PlayerAnimation.PICKUP_DOWN,
                    repeat: -1,
                },
                true,
            );
        } else if (DIRECTION.isMovingUp) {
            this.gameObject.play(
                {
                    key: PlayerAnimation.PICKUP_UP,
                    repeat: -1,
                },
                true,
            );
        } else if (DIRECTION.isMovingLeft) {
            this.gameObject.play(
                {
                    key: PlayerAnimation.PICKUP_LEFT,
                    repeat: -1,
                },
                true,
            );
        } else if (DIRECTION.isMovingRight) {
            this.gameObject.play(
                {
                    key: PlayerAnimation.PICKUP_RIGHT,
                    repeat: -1,
                },
                true,
            );
        }
    }

    onExit() {
        super.onExit();
        // Handle exiting the idle state
    }

    onUpdate(args?: unknown[]) {
        this.stateMachine.setState(PlayerStates.IDLE_HOLDING, DIRECTION);
    }
}

export default LiftState;
