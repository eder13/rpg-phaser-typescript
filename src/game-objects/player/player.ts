import { Position } from '../../common/types';
import * as Phaser from 'phaser';

export interface PlayerConfig {
    scene: Phaser.Scene;
    position: Position;
    assetKey: string;
    frame?: number;
}

class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(config: PlayerConfig) {
        const { scene, position, assetKey, frame } = config;

        super(scene, position.x, position.y, assetKey, frame);

        // add the Player Object to the scene that we create here
        scene.add.existing(this);
        // add Physics to the scene
        scene.physics.add.existing(this);
    }
}

export default Player;
