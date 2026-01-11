import { Position } from '../../common/types';
import * as Phaser from 'phaser';
import InputComponent from '../../components/input-component/input';
import ControlsComponent from '../../components/game-object/controls-component';
import StateMachine from '../../components/state-machine/state-machine';
import { BossStates, SawStates } from '../../components/state-machine/states/states';
import {
    BOSS_HURT_PUSHBACK_SPEED,
    TWEEN_DURATION,
    TWEEN_SCALE_X_PULSE,
    TWEEN_SCALE_Y_PULSE,
} from '../../common/globals';
import BounceMoveState from '../../components/state-machine/states/saw/bounce-move-state';
import InvulnerableComponent from '../../components/game-object/invulnerable-component';
import LifeComponent from '../../components/game-object/life-component';
import HurtStateBoss from '../../components/state-machine/states/boss/hurt-state';
import DeathStateBoss from '../../components/state-machine/states/boss/death-state';
import RandomStateBoss from '../../components/state-machine/states/boss/random-state';
import IdleStateBoss from '../../components/state-machine/states/boss/idle-state';
import AttackStateBoss from '../../components/state-machine/states/boss/attack-state';

export interface BossConfig {
    scene: Phaser.Scene;
    position: Position;
    assetKey: string;
    frame?: number;
    movement: InputComponent;
    isInvulnerable?: boolean;
    invulnerableDuration?: number;
    maxLife: number;
}

class Boss extends Phaser.Physics.Arcade.Sprite {
    controlsComponent: ControlsComponent;
    invulnerableComponent: InvulnerableComponent;
    stateMachine: StateMachine;
    lifeComponent: LifeComponent;
    isDefeated: boolean = false;
    fightHasStarted: boolean = false;

    constructor(config: BossConfig) {
        const { scene, position, assetKey, frame, movement, isInvulnerable, invulnerableDuration, maxLife } = config;
        super(scene, position.x, position.y, assetKey, frame);

        // add the Spider Object to the scene that we create here
        scene.add.existing(this);
        // add Physics to the scene
        scene.physics.add.existing(this).setDepth(4);

        // update the physics body size
        this.body?.setSize(26, 28, true).setOffset(14, 6);

        // All the components that are used here.
        this.controlsComponent = new ControlsComponent(this, movement);
        this.invulnerableComponent = new InvulnerableComponent(this, isInvulnerable, invulnerableDuration);
        this.lifeComponent = new LifeComponent(this, maxLife);

        this.stateMachine = new StateMachine('boss');
        const idleState: IdleStateBoss = new IdleStateBoss(this);
        this.stateMachine.addState(idleState);
        const hurtState: HurtStateBoss = new HurtStateBoss(
            this,
            BOSS_HURT_PUSHBACK_SPEED,
            undefined,
            BossStates.RANDOM,
        );
        this.stateMachine.addState(hurtState);
        const deathState: DeathStateBoss = new DeathStateBoss(this, () => {
            this.isDefeated = true;
        });
        this.stateMachine.addState(deathState);
        const randomState: RandomStateBoss = new RandomStateBoss(this, [
            new Phaser.Math.Vector2(300, 160),
            new Phaser.Math.Vector2(200, 280),
            new Phaser.Math.Vector2(400, 280),
        ]);
        this.stateMachine.addState(randomState);
        const preAttackState: AttackStateBoss = new AttackStateBoss(this);
        this.stateMachine.addState(preAttackState);
        this.stateMachine.setState(BossStates.IDLE);
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

    public hit(damage: number, hitDirection) {
        if (this.invulnerableComponent.invulnerable) {
            return;
        }
        this.lifeComponent.takeDamage(damage);

        if (this.lifeComponent.currentLives <= 0) {
            console.log('[boss] play death state');
            this.isDefeated = true;
            this.stateMachine.setState(BossStates.DEATH, hitDirection);
            return;
        }

        console.log('[boss] play hurt state');
        this.stateMachine.setState(BossStates.HURT, hitDirection);
    }

    public disableObject() {
        (this.body as Phaser.Physics.Arcade.Body).enable = false;
        this.visible = false;
        this.active = false;
    }

    startFight() {
        if (!this.isDefeated && !this.fightHasStarted) {
            this.fightHasStarted = true;
            console.log('[boss] starting fight');
            this.stateMachine.setState(BossStates.RANDOM);
        }
    }
}

export default Boss;
