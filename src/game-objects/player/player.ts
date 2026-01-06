import { PlayerAnimation } from '../../common/assets';
import { CustomGameObject, GameObject, Position } from '../../common/types';
import * as Phaser from 'phaser';
import InputComponent from '../../components/input-component/input';
import ControlsComponent from '../../components/game-object/controls-component';
import IdleState from '../../components/state-machine/states/player/idle-state';
import StateMachine from '../../components/state-machine/state-machine';
import { PlayerStates } from '../../components/state-machine/states/states';
import RunningState from '../../components/state-machine/states/player/running-state';
import { DIRECTION, PUSH_BACK_SPEED, SPEED_PLAYER } from '../../common/globals';
import InvulnerableComponent from '../../components/game-object/invulnerable-component';
import HurtState from '../../components/state-machine/states/player/hurt-state';
import LifeComponent from '../../components/game-object/life-component';
import DeathStatePlayer from '../../components/state-machine/states/player/death-state';
import CollidingObjectComponent from '../../components/game-object/colliding-object-component';
import MoveHoldingState from '../../components/state-machine/states/player/move-holding-state';
import IdleHoldingState from '../../components/state-machine/states/player/idle-holding-state';
import OpenChestState from '../../components/state-machine/states/player/open-chest-state';
import LiftState from '../../components/state-machine/states/player/lift-state';
import ObjectHeldComponent from '../../components/game-object/object-held-component';
import ThrowableObjectComponent from '../../components/game-object/throwable-object-component';
import ThrowState from '../../components/state-machine/states/player/throw-state';

export interface PlayerConfig {
    scene: Phaser.Scene;
    position: Position;
    assetKey: string;
    frame?: number;
    playerMovement: InputComponent;
    isInvulnerable?: boolean;
    invulnerableDuration?: number;
    maxLife: number;
}

class Player extends Phaser.Physics.Arcade.Sprite implements CustomGameObject {
    controlsComponent: ControlsComponent;
    invulnerableComponent: InvulnerableComponent;
    lifeComponent: LifeComponent;
    stateMachine: StateMachine;
    collidingObjectComponent: CollidingObjectComponent;

    public objectHeldComponent: ObjectHeldComponent;
    isDefeated: boolean;

    constructor(config: PlayerConfig) {
        const { scene, position, assetKey, frame, playerMovement, isInvulnerable, invulnerableDuration, maxLife } =
            config;
        super(scene, position.x, position.y, assetKey, frame);

        // All the components that are used here.
        this.controlsComponent = new ControlsComponent(this, playerMovement);
        this.invulnerableComponent = new InvulnerableComponent(this, isInvulnerable, invulnerableDuration);
        this.lifeComponent = new LifeComponent(this, maxLife);
        this.collidingObjectComponent = new CollidingObjectComponent(this);
        this.objectHeldComponent = new ObjectHeldComponent(this);

        // state machine
        this.stateMachine = new StateMachine('player');
        const idleState: IdleState = new IdleState(this);
        this.stateMachine.addState(idleState);
        const runningState: RunningState = new RunningState(this);
        this.stateMachine.addState(runningState);
        const hurtState = new HurtState(this, PUSH_BACK_SPEED, undefined, PlayerStates.IDLE);
        this.stateMachine.addState(hurtState);
        const deathState = new DeathStatePlayer(this, () => {
            console.log('Player has died');
        });
        this.stateMachine.addState(deathState);
        const moveHoldingState = new MoveHoldingState(this);
        this.stateMachine.addState(moveHoldingState);
        const idleHoldingState = new IdleHoldingState(this);
        this.stateMachine.addState(idleHoldingState);
        const openChestState = new OpenChestState(this);
        this.stateMachine.addState(openChestState);
        const liftState = new LiftState(this);
        this.stateMachine.addState(liftState);
        const throwState = new ThrowState(this);
        this.stateMachine.addState(throwState);
        this.stateMachine.setState(PlayerStates.IDLE);

        this.isDefeated = false;

        // add the Player Object to the scene that we create here
        scene.add.existing(this);
        // add Physics to the scene
        scene.physics.add.existing(this);

        // update the physics body size
        this.physicsBody.setSize(10, 12, true).setOffset(3, 10);

        // register the update method that triggers on every frame
        config.scene.events.on(Phaser.Scenes.Events.UPDATE, this.update, this);
        // shut down the scene once we transition to the next one
        config.scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            config.scene.events.off(Phaser.Scenes.Events.UPDATE, this.update, this);
        });
    }

    update(): void {
        this.stateMachine.update();
        this.collidingObjectComponent.reset();
    }

    get controls() {
        return this.controlsComponent.controls;
    }

    get physicsBody() {
        return this.body as Phaser.Physics.Arcade.Body;
    }

    get _invulnerableComponent() {
        return this.invulnerableComponent;
    }

    get _isDefeated() {
        return this.isDefeated;
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

    hit(damage: number) {
        if (this.invulnerableComponent.invulnerable) {
            return;
        }

        this.lifeComponent.takeDamage(damage);

        if (this.lifeComponent.currentLives <= 0) {
            this.isDefeated = true;
            this.stateMachine.setState(PlayerStates.DEATH);
            return;
        }

        this.stateMachine.setState(PlayerStates.HURT);
    }

    public enableObject(): void {
        (this.body as Phaser.Physics.Arcade.Body).enable = true;
        this.visible = true;
        this.active = true;
    }

    public disableObject(): void {
        (this.body as Phaser.Physics.Arcade.Body).enable = false;
        this.visible = false;
        this.active = false;
    }

    public collidingWithObject(object: GameObject) {
        console.log('####** adObject');
        this.collidingObjectComponent.addObject(object);
    }
}

export default Player;
