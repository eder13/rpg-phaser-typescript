import { PlayerAnimation } from '../../common/assets';
import { Position } from '../../common/types';
import * as Phaser from 'phaser';
import InputComponent from '../../components/input-component/input';
import ControlsComponent from '../../components/game-object/controls-component';
import IdleState from '../../components/state-machine/states/player/idle-state';
import StateMachine from '../../components/state-machine/state-machine';
import { PlayerStates } from '../../components/state-machine/states/player/player-states';
import RunningState from '../../components/state-machine/states/player/running-state';
import { SPEED_PLAYER } from '../../common/globals';

export interface PlayerConfig {
    scene: Phaser.Scene;
    position: Position;
    assetKey: string;
    frame?: number;
    playerMovement: InputComponent;
}

class Player extends Phaser.Physics.Arcade.Sprite {
    controlsComponent: ControlsComponent;
    stateMachine: StateMachine;

    constructor(config: PlayerConfig) {
        const { scene, position, assetKey, frame, playerMovement } = config;
        super(scene, position.x, position.y, assetKey, frame);

        // All the components that are used here.
        this.controlsComponent = new ControlsComponent(this, playerMovement);

        this.stateMachine = new StateMachine('player');
        const idleState: IdleState = new IdleState(this);
        this.stateMachine.addState(idleState);
        const runningState: RunningState = new RunningState(this);
        this.stateMachine.addState(runningState);
        this.stateMachine.setState(PlayerStates.IDLE);

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
        this.stateMachine.update();
    }

    get controls() {
        return this.controlsComponent.controls;
    }

    public updateVelocity(isX: boolean, value: number) {
        if (this.body) {
            if (isX) {
                this.body.velocity.x = value * SPEED_PLAYER;
            } else {
                this.body.velocity.y = value * SPEED_PLAYER;
            }

            this.body.velocity.normalize().scale(SPEED_PLAYER);
        }
    }
}

export default Player;
