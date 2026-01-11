import { PlayerAnimation } from '../../../../common/assets';
import Player from '../../../../game-objects/player/player';
import AbstractMovableState from '../../base/abstract-movable-state';
import { PlayerStates } from '../states';
import {
    BLOCK_ATTACK_MOVEMENT,
    DIRECTION,
    INTERACTIVE_OBJECT_TYPE,
    WORLD_FREEZE_STATE_PLAYER,
} from '../../../../common/globals';
import InputComponent from '../../../input-component/input';
import Logger from '../../../../common/logger';

class RunningState extends AbstractMovableState {
    private lastStepTime = 0;
    private stepInterval = 300; // ms, anpassen (z.B. 250..400)

    constructor(gameObject: Player) {
        super(PlayerStates.RUNNING, gameObject);
    }

    onUpdate(args?: unknown[]) {
        const now = this.gameObject.scene.time.now;

        // Wenn gesperrt: keinerlei Input verarbeiten -> Velocity stoppen
        if (this.gameObject.controls.locked) {
            this.gameObject.updateVelocity(true, 0);
            this.gameObject.updateVelocity(false, 0);
            // optional: this.gameObject.anims.stop(); // falls Animation ebenfalls stoppen soll
            return;
        }

        if (this.gameObject.controls.isAttackKeyDown) {
            console.log('[attack]: is attack down');

            this.stateMachine.setState(PlayerStates.ATTACK, DIRECTION);
            BLOCK_ATTACK_MOVEMENT.blockAttackMovement = true;

            return;
        }

        if (BLOCK_ATTACK_MOVEMENT.blockAttackMovement) {
            this.gameObject.updateVelocity(true, 0);
            this.gameObject.updateVelocity(false, 0);

            return;
        }

        if (WORLD_FREEZE_STATE_PLAYER.isFrozen) {
            this.gameObject.updateVelocity(true, 0);
            this.gameObject.updateVelocity(false, 0);
            return;
        }

        if (
            !this.gameObject.controls.isDownDown &&
            !this.gameObject.controls.isUpDown &&
            !this.gameObject.controls.isLeftDown &&
            !this.gameObject.controls.isRightDown
        ) {
            this.stateMachine.setState(PlayerStates.IDLE);
            DIRECTION.isPlayerMoving = false;
        }

        if (!this.gameObject.controls.locked) {
            const objectInteracted = this.checkObjectInteractedWith(this.gameObject.controls);
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

                if (now - this.lastStepTime >= this.stepInterval) {
                    if (this.gameObject.scene.cache.audio.exists('SFX_FOOT_STEPS')) {
                        this.gameObject.scene.sound.play('SFX_FOOT_STEPS', { volume: 0.2 });
                        this.lastStepTime = now;
                    }
                }

                this.gameObject.updateVelocity(false, 1);
                DIRECTION.isPlayerMoving = true;
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

                if (now - this.lastStepTime >= this.stepInterval) {
                    if (this.gameObject.scene.cache.audio.exists('SFX_FOOT_STEPS')) {
                        this.gameObject.scene.sound.play('SFX_FOOT_STEPS', { volume: 0.2 });
                        this.lastStepTime = now;
                    }
                }

                this.gameObject.updateVelocity(false, -1);
                DIRECTION.isPlayerMoving = true;
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

                    if (now - this.lastStepTime >= this.stepInterval) {
                        if (this.gameObject.scene.cache.audio.exists('SFX_FOOT_STEPS')) {
                            this.gameObject.scene.sound.play('SFX_FOOT_STEPS', { volume: 0.2 });
                            this.lastStepTime = now;
                        }
                    }
                }

                this.gameObject.updateVelocity(true, -1);
                DIRECTION.isPlayerMoving = true;
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

                    if (now - this.lastStepTime >= this.stepInterval) {
                        if (this.gameObject.scene.cache.audio.exists('SFX_FOOT_STEPS')) {
                            this.gameObject.scene.sound.play('SFX_FOOT_STEPS', { volume: 0.2 });
                            this.lastStepTime = now;
                        }
                    }
                }
                this.gameObject.updateVelocity(true, 1);
                DIRECTION.isPlayerMoving = true;
            } else {
                this.gameObject.updateVelocity(true, 0);
            }
        }
    }

    private checkObjectInteractedWith(controls: InputComponent) {
        const collidingObjectComponent = (this.gameObject as any)?.collidingObjectComponent?.objects;

        if (collidingObjectComponent === undefined || collidingObjectComponent?.objects?.length === 0) {
            return false;
        }

        const collisionComponent = collidingObjectComponent?.[0];

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
            this.stateMachine.setState(PlayerStates.LIFT, collisionComponent);
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
