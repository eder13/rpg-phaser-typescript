import { Position } from '../../common/types';
import * as Phaser from 'phaser';
import InputComponent from '../../components/input-component/input';
import ControlsComponent from '../../components/game-object/controls-component';
import StateMachine from '../../components/state-machine/state-machine';
import { SpiderStates } from '../../components/state-machine/states/states';
import {
    DELAY_SPIDER_CHANGE_DIRECTION_MAX,
    DELAY_SPIDER_CHANGE_DIRECTION_MIN,
    DELAY_SPIDER_CHANGE_DIRECTION_WAIT,
    SPEED_PLAYER,
    SPEED_SPIDER,
    SPIDER_HURT_PUSHBACK_SPEED,
} from '../../common/globals';
import IdleStateSpider from '../../components/state-machine/states/spider/idle-state';
import RunningStateSpider from '../../components/state-machine/states/spider/running-state';
import InvulnerableComponent from '../../components/game-object/invulnerable-component';
import LifeComponent from '../../components/game-object/life-component';
import HurtStateSpider from '../../components/state-machine/states/spider/hurt-state';

export interface SpiderConfig {
    scene: Phaser.Scene;
    position: Position;
    assetKey: string;
    frame?: number;
    movement: InputComponent;
    isInvulnerable?: boolean;
    invulnerableDuration?: number;
    maxLife: number;
}

class Spider extends Phaser.Physics.Arcade.Sprite {
    controlsComponent: ControlsComponent;
    invulnerableComponent: InvulnerableComponent;
    lifeComponent: LifeComponent;
    stateMachine: StateMachine;

    isDefeated: boolean;

    constructor(config: SpiderConfig) {
        const { scene, position, assetKey, frame, movement, isInvulnerable, invulnerableDuration, maxLife } = config;
        super(scene, position.x, position.y, assetKey, frame);

        // All the components that are used here.
        this.controlsComponent = new ControlsComponent(this, movement);
        this.invulnerableComponent = new InvulnerableComponent(this, isInvulnerable, invulnerableDuration);
        this.lifeComponent = new LifeComponent(this, maxLife);

        this.stateMachine = new StateMachine('spider');
        const idleState: IdleStateSpider = new IdleStateSpider(this);
        //const runningState: RunningStateSpider = new RunningStateSpider(this);
        this.stateMachine.addState(idleState);
        //this.stateMachine.addState(runningState);
        this.stateMachine.setState(SpiderStates.IDLE);
        const hurtState: HurtStateSpider = new HurtStateSpider(
            this,
            SPIDER_HURT_PUSHBACK_SPEED,
            undefined,
            SpiderStates.RUNNING,
        );
        this.stateMachine.addState(hurtState);

        this.isDefeated = false;

        this.scene.time.addEvent({
            delay: Phaser.Math.Between(DELAY_SPIDER_CHANGE_DIRECTION_MIN, DELAY_SPIDER_CHANGE_DIRECTION_MAX),
            callback: () => {
                this.changeDirection();
            },
            callbackScope: this,
            loop: false,
        });

        // add the Spider Object to the scene that we create here
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

    changeDirection() {
        this.controls.reset();
        this.scene.time.delayedCall(DELAY_SPIDER_CHANGE_DIRECTION_WAIT, () => {
            const randomDirection = Phaser.Math.Between(0, 3);

            if (randomDirection === 0) {
                this.controls.isUpDown = true;
            } else if (randomDirection === 1) {
                this.controls.isDownDown = true;
            } else if (randomDirection === 2) {
                this.controls.isLeftDown = true;
            } else if (randomDirection === 3) {
                this.controls.isRightDown = true;
            }

            this.scene.time.addEvent({
                delay: Phaser.Math.Between(DELAY_SPIDER_CHANGE_DIRECTION_MIN, DELAY_SPIDER_CHANGE_DIRECTION_MAX),
                callback: () => {
                    this.changeDirection();
                },
                callbackScope: this,
                loop: false,
            });
        });
    }

    update(): void {
        this.stateMachine.update();
    }

    get controls() {
        return this.controlsComponent.controls;
    }

    get _isDefeated() {
        return this.isDefeated;
    }

    public updateVelocity(isX: boolean, value: number) {
        if (this.body) {
            if (isX) {
                this.body.velocity.x = value * SPEED_SPIDER;
            } else {
                this.body.velocity.y = value * SPEED_SPIDER;
            }

            this.body.velocity.normalize().scale(SPEED_SPIDER);
        }
    }

    public hit(damage: number) {
        if (this.invulnerableComponent.invulnerable) {
            return;
        }
        this.lifeComponent.takeDamage(damage);

        if (this.lifeComponent.currentLives <= 0) {
            this.isDefeated = true;
            //this.stateMachine.setState(SpiderStates.DEFEATED);
            // TODO: is defeated animation death
        }

        this.stateMachine.setState(SpiderStates.HURT);
    }
}

export default Spider;
