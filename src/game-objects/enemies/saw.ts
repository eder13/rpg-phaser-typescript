import { Position } from '../../common/types';
import * as Phaser from 'phaser';
import InputComponent from '../../components/input-component/input';
import ControlsComponent from '../../components/game-object/controls-component';
import StateMachine from '../../components/state-machine/state-machine';
import { SawStates } from '../../components/state-machine/states/states';
import { TWEEN_DURATION, TWEEN_SCALE_X_PULSE, TWEEN_SCALE_Y_PULSE } from '../../common/globals';
import BounceMoveState from '../../components/state-machine/states/saw/bounce-move-state';
import InvulnerableComponent from '../../components/game-object/invulnerable-component';

export interface SawConfig {
    scene: Phaser.Scene;
    position: Position;
    assetKey: string;
    frame?: number;
    movement: InputComponent;
    isInvulnerable?: boolean;
    invulnerableDuration?: number;
}

class Saw extends Phaser.Physics.Arcade.Sprite {
    controlsComponent: ControlsComponent;
    invulnerableComponent: InvulnerableComponent;
    stateMachine: StateMachine;

    constructor(config: SawConfig) {
        const { scene, position, assetKey, frame, movement, isInvulnerable, invulnerableDuration } = config;
        super(scene, position.x, position.y, assetKey, frame);

        // add the Spider Object to the scene that we create here
        scene.add.existing(this);
        // add Physics to the scene
        scene.physics.add.existing(this);

        // All the components that are used here.
        this.controlsComponent = new ControlsComponent(this, movement);
        this.invulnerableComponent = new InvulnerableComponent(this, isInvulnerable, invulnerableDuration);

        this.stateMachine = new StateMachine('saw');
        //const bounceMoveState: BounceMoveState = new BounceMoveState(this);
        //this.stateMachine.addState(bounceMoveState);
        this.stateMachine.setState(SawStates.BOUNCE_MOVE);

        this.scene.tweens.add({
            targets: this,
            scaleX: TWEEN_SCALE_X_PULSE,
            scaleY: TWEEN_SCALE_Y_PULSE,
            duration: TWEEN_DURATION,
            yoyo: true,
            repeat: -1,
        });

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

    public updateVelocity(isX: boolean, value: number) {}
}

export default Saw;
