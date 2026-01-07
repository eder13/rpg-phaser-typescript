import * as Phaser from 'phaser';
import { Position } from '../../common/types';
import { ASSET_KEYS } from '../../common/assets';
import BurningStateFire from '../../components/state-machine/states/fire/burning-state';
import StateMachine from '../../components/state-machine/state-machine';
import { FireStates } from '../../components/state-machine/states/states';

type FireConfig = {
    scene: Phaser.Scene;
    position: Position;
};

class Fire extends Phaser.Physics.Arcade.Sprite {
    stateMachine: StateMachine;

    constructor(config: FireConfig) {
        super(config.scene, config.position.x, config.position.y, ASSET_KEYS.FIRE_IDLE, 0);

        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);
        this.setOrigin(0, 1).setImmovable(true).setDepth(3);

        this.stateMachine = new StateMachine('fire');
        const burningState = new BurningStateFire(this);
        this.stateMachine.addState(burningState);
        this.stateMachine.setState(FireStates.BURNING);
    }
}

export default Fire;
