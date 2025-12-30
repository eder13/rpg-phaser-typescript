import { PlayerAnimation } from '../../../../common/assets';
import Player from '../../../../game-objects/player/player';
import BasePlayerState from './base-player-state';
import { PlayerStates } from '../states';
import { DIRECTION, INTERACTIVE_OBJECT_TYPE } from '../../../../common/globals';
import InputComponent from '../../../input-component/input';
import CollidingObjectComponent from '../../../game-object/colliding-object-component';
import InteractiveObjectComponent from '../../../game-object/interactive-object-compoent';
import Logger from '../../../../common/logger';

class RunningState extends BasePlayerState {
    constructor(gameObject: Player) {
        super(PlayerStates.RUNNING, gameObject);
    }

    onUpdate(args?: unknown[]) {
        if (
            !this.gameObject.controls.isDownDown &&
            !this.gameObject.controls.isUpDown &&
            !this.gameObject.controls.isLeftDown &&
            !this.gameObject.controls.isRightDown
        ) {
            this.stateMachine.setState(PlayerStates.IDLE);
        }

        const objectInteracted = this.checkObjectInteractedWith(this.gameObject.controls);

        console.log('####** objectInteracted', objectInteracted);

        if (objectInteracted) {
            return;
        }

        if (this.gameObject.controlsComponent.controls.isDownDown) {
            DIRECTION.isMovingDown = true;
            DIRECTION.isMovingUp = false;
            DIRECTION.isMovingLeft = false;
            DIRECTION.isMovingRight = false;

            this.gameObject.play(
                {
                    key: PlayerAnimation.WALKING_DOWN,
                    repeat: -1,
                },
                true,
            );
            this.gameObject.updateVelocity(false, 1);
        } else if (this.gameObject.controlsComponent.controls.isUpDown) {
            DIRECTION.isMovingDown = false;
            DIRECTION.isMovingUp = true;
            DIRECTION.isMovingLeft = false;
            DIRECTION.isMovingRight = false;

            this.gameObject.play(
                {
                    key: PlayerAnimation.WALKING_UP,
                    repeat: -1,
                },
                true,
            );
            this.gameObject.updateVelocity(false, -1);
        } else {
            this.gameObject.updateVelocity(false, 0);
        }

        const isMovingvertically =
            this.gameObject.controlsComponent.controls.isUpDown ||
            this.gameObject.controlsComponent.controls.isDownDown;

        if (this.gameObject.controlsComponent.controls.isLeftDown) {
            if (DIRECTION.isMovingUp) {
                DIRECTION.isMovingUpLeft = true;
            }
            if (DIRECTION.isMovingDown) {
                DIRECTION.isMovingDownLeft = true;
            }
            DIRECTION.isMovingLeft = true;
            DIRECTION.isMovingRight = false;
            DIRECTION.isMovingDownRight = false;
            DIRECTION.isMovingUpRight = false;

            if (!isMovingvertically) {
                DIRECTION.isMovingDown = false;
                DIRECTION.isMovingUp = false;

                this.gameObject.play(
                    {
                        key: PlayerAnimation.WALKING_LEFT,
                        repeat: -1,
                    },
                    true,
                );
            }

            this.gameObject.updateVelocity(true, -1);
        } else if (this.gameObject.controlsComponent.controls.isRightDown) {
            if (DIRECTION.isMovingUp) {
                DIRECTION.isMovingUpRight = true;
            }
            if (DIRECTION.isMovingDown) {
                DIRECTION.isMovingDownRight = true;
            }
            DIRECTION.isMovingRight = true;
            DIRECTION.isMovingLeft = false;
            DIRECTION.isMovingDownLeft = false;
            DIRECTION.isMovingUpLeft = false;

            if (!isMovingvertically) {
                DIRECTION.isMovingDownRight = false;
                DIRECTION.isMovingUpRight = false;
                DIRECTION.isMovingDownLeft = false;
                DIRECTION.isMovingUpLeft = false;
                DIRECTION.isMovingDown = false;
                DIRECTION.isMovingUp = false;

                this.gameObject.play(
                    {
                        key: PlayerAnimation.WALKING_RIGHT,
                        repeat: -1,
                    },
                    true,
                );
            }
            this.gameObject.updateVelocity(true, 1);
        } else {
            this.gameObject.updateVelocity(true, 0);
        }
    }

    private checkObjectInteractedWith(controls: InputComponent) {
        console.log('#####** checkObjectInteractedWith');

        const collidingObjectComponent = (this.gameObject as any)?.collidingObjectComponent?.objects;

        console.log('#####** collidingObjectComponent.objects.length', collidingObjectComponent?.objects?.length);

        console.log('#####** collidingObjectComponent', collidingObjectComponent);

        if (collidingObjectComponent === undefined || collidingObjectComponent?.objects?.length === 0) {
            return false;
        }

        console.log('####** colliding component', collidingObjectComponent);

        const collisionComponent = collidingObjectComponent?.[0];

        console.log('#####** collisionComponent', collisionComponent);

        if (!collisionComponent) {
            return;
        }

        const interactivecomponent = collisionComponent?._interactiveObjectComponent;

        if (!interactivecomponent) {
            return false;
        }

        if (!this.gameObject.controlsComponent.controls.isActionKeyDown) {
            return false;
        }

        if (!interactivecomponent._canInteractCheck()) {
            return false;
        }
        console.log('#####** trying to interact', interactivecomponent);
        interactivecomponent.interact();

        if (interactivecomponent.objectType === INTERACTIVE_OBJECT_TYPE.PICKUP) {
            this.stateMachine.setState(PlayerStates.LIFT);
            return true;
        }

        if (interactivecomponent.objectType === INTERACTIVE_OBJECT_TYPE.OPEN) {
            this.stateMachine.setState(PlayerStates.OPEN_CHEST, collidingObjectComponent);
            return true;
        }

        if (interactivecomponent.objectType === INTERACTIVE_OBJECT_TYPE.AUTO) {
            return false;
        }

        Logger.error('Unknown interactive object type');
        return false;
    }
}

export default RunningState;
