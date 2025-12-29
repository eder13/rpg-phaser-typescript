import { PlayerAnimation } from '../../common/assets';
import { Position } from '../../common/types';
import * as Phaser from 'phaser';
import InputComponent from '../../components/input-component/input';
import ControlsComponent from '../../components/game-object/controls-component';

export interface PlayerConfig {
    scene: Phaser.Scene;
    position: Position;
    assetKey: string;
    frame?: number;
    playerMovement: InputComponent;
}

class Player extends Phaser.Physics.Arcade.Sprite {
    controlsComponent!: ControlsComponent;
    lastMovement = {
        isMovingRight: false,
        isMovingLeft: false,
        isMovingUp: false,
        isMovingDown: false,
    };

    constructor(config: PlayerConfig) {
        const { scene, position, assetKey, frame, playerMovement } = config;
        super(scene, position.x, position.y, assetKey, frame);
        this.controlsComponent = new ControlsComponent(this, playerMovement);

        // add the Player Object to the scene that we create here
        scene.add.existing(this);
        // add Physics to the scene
        scene.physics.add.existing(this);

        // register the update method that triggers on every frame
        config.scene.events.on(Phaser.Scenes.Events.UPDATE, this.update, this);
        // shut down the scene once we transition to the next one
        config.scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            config.scene.events.off(Phaser.Scenes.Events.UPDATE, this.update, this);
        });
    }

    update(): void {
        const lastMovement = {
            isMovingRight: false,
            isMovingLeft: false,
            isMovingUp: false,
            isMovingDown: false,
        };

        if (this.controlsComponent.controls.isDownDown) {
            lastMovement.isMovingDown = true;
            lastMovement.isMovingUp = false;
            lastMovement.isMovingLeft = false;
            lastMovement.isMovingRight = false;

            this.play(
                {
                    key: PlayerAnimation.WALKING_DOWN,
                    repeat: -1,
                },
                true,
            );
            this.updateVelocity(false, 1);
        } else if (this.controlsComponent.controls.isUpDown) {
            lastMovement.isMovingDown = false;
            lastMovement.isMovingUp = true;
            lastMovement.isMovingLeft = false;
            lastMovement.isMovingRight = false;

            this.play(
                {
                    key: PlayerAnimation.WALKING_UP,
                    repeat: -1,
                },
                true,
            );
            this.updateVelocity(false, -1);
        } else {
            this.updateVelocity(false, 0);
        }

        const isMovingvertically =
            this.controlsComponent.controls.isUpDown || this.controlsComponent.controls.isDownDown;

        if (this.controlsComponent.controls.isLeftDown) {
            if (!isMovingvertically) {
                lastMovement.isMovingDown = false;
                lastMovement.isMovingUp = false;
                lastMovement.isMovingLeft = true;
                lastMovement.isMovingRight = false;

                this.play(
                    {
                        key: PlayerAnimation.WALKING_LEFT,
                        repeat: -1,
                    },
                    true,
                );
            }

            this.updateVelocity(true, -1);
        } else if (this.controlsComponent.controls.isRightDown) {
            if (!isMovingvertically) {
                lastMovement.isMovingDown = false;
                lastMovement.isMovingUp = false;
                lastMovement.isMovingLeft = false;
                lastMovement.isMovingRight = true;

                this.play(
                    {
                        key: PlayerAnimation.WALKING_RIGHT,
                        repeat: -1,
                    },
                    true,
                );
            }
            this.updateVelocity(true, 1);
        } else {
            this.updateVelocity(true, 0);
        }

        if (
            lastMovement.isMovingDown ||
            lastMovement.isMovingLeft ||
            lastMovement.isMovingRight ||
            lastMovement.isMovingUp
        ) {
            this.lastMovement = lastMovement;
        }

        if (
            !this.controlsComponent.controls.isRightDown &&
            !this.controlsComponent.controls.isLeftDown &&
            !this.controlsComponent.controls.isUpDown &&
            !this.controlsComponent.controls.isDownDown
        ) {
            if (
                !this.lastMovement.isMovingDown &&
                !this.lastMovement.isMovingUp &&
                !this.lastMovement.isMovingLeft &&
                !this.lastMovement.isMovingRight
            ) {
                this.play(
                    {
                        key: PlayerAnimation.IDLE_DOWN,
                        repeat: -1,
                    },
                    true,
                );
            }

            if (this.lastMovement.isMovingDown) {
                this.play(
                    {
                        key: PlayerAnimation.IDLE_DOWN,
                        repeat: -1,
                    },
                    true,
                );
            }

            if (this.lastMovement.isMovingUp) {
                this.play(
                    {
                        key: PlayerAnimation.IDLE_UP,
                        repeat: -1,
                    },
                    true,
                );
            }

            if (this.lastMovement.isMovingLeft) {
                this.play(
                    {
                        key: PlayerAnimation.IDLE_LEFT,
                        repeat: -1,
                    },
                    true,
                );
            }

            if (this.lastMovement.isMovingRight) {
                this.play(
                    {
                        key: PlayerAnimation.IDLE_RIGHT,
                        repeat: -1,
                    },
                    true,
                );
            }
        }
    }

    private updateVelocity(isX: boolean, value: number) {
        if (this.body) {
            if (isX) {
                this.body.velocity.x = value * 80;
            } else {
                this.body.velocity.y = value * 80;
            }

            this.body.velocity.normalize().scale(80);
        }
    }
}

export default Player;
