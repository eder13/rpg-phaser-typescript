import * as Phaser from 'phaser';
import { SCENE_KEYS } from './scenes/scene-keys';
import { PreloadScene } from './scenes/preload-scene';
import { GameScene } from './scenes/game-scene';
import { GameTestScene } from './scenes/game-test-scene';

const gameConfig: Phaser.Types.Core.GameConfig = {
    type: Phaser.WEBGL,
    pixelArt: true,
    roundPixels: true,
    width: 640,
    height: 360,
    scale: {
        parent: 'game-container',
        autoCenter: Phaser.Scale.CENTER_BOTH,
        mode: Phaser.Scale.FIT,
    },
    backgroundColor: '#000000',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0, x: 0 },
            fps: 60,
            debug: false,
        },
    },
    fps: { target: 60, forceSetTimeOut: false },
    render: { pixelArt: true, antialias: false },
};

const game = new Phaser.Game(gameConfig);

game.scene.add(SCENE_KEYS.PRELOAD_SCENE, PreloadScene);
game.scene.add(SCENE_KEYS.GAME_SCENE, GameScene);
game.scene.add(SCENE_KEYS.GAME_TEST_SCENE, GameTestScene);
game.scene.start(SCENE_KEYS.PRELOAD_SCENE);
