import * as Phaser from 'phaser';
import { Position } from '../../common/types';
import { ASSET_KEYS } from '../../common/assets';
import StateMachine from '../../components/state-machine/state-machine';
import { SpikeStates } from '../../components/state-machine/states/states';
import SpikeIdleState from '../../components/state-machine/states/spike/idle-state';

type SpikeConfig = {
    scene: Phaser.Scene;
    position: Position;
};

class Spike extends Phaser.Physics.Arcade.Sprite {
    stateMachine: StateMachine;

    constructor(config: SpikeConfig) {
        super(config.scene, config.position.x, config.position.y, ASSET_KEYS.SPIKE, 0);

        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);
        this.setOrigin(0, 1).setImmovable(true).setDepth(5);

        this.stateMachine = new StateMachine('spike');
        const spikeIdleState = new SpikeIdleState(this);
        this.stateMachine.addState(spikeIdleState);
        this.stateMachine.setState(SpikeStates.IDLE);
    }
}

export default Spike;
