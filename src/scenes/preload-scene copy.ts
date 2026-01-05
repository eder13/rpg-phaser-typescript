import * as Phaser from 'phaser';
import { SCENE_KEYS } from './scene-keys';
import { ASSET_KEYS, ASSET_PACK_KEYS, PlayerAnimation } from '../common/assets';

export class PreloadScene extends Phaser.Scene {
    constructor() {
        super({
            key: SCENE_KEYS.PRELOAD_SCENE,
        });
    }

    public preload(): void {
        // load asset pack that has assets for the rest of the game
        this.load.pack(ASSET_PACK_KEYS.MAIN, 'assets/data/assets.json');
    }

    public create(): void {
        this.createAnimations();
        this.scene.start(SCENE_KEYS.GAME_SCENE);
    }

    createAnimations() {
        this.anims.createFromAseprite(ASSET_KEYS.PLAYER);
        this.anims.createFromAseprite(ASSET_KEYS.SPIDER);
        this.anims.createFromAseprite(ASSET_KEYS.SAW);
        this.anims.createFromAseprite(ASSET_KEYS.FIRE);
        this.anims.create({
            key: ASSET_KEYS.ENEMY_DEATH,
            frames: this.anims.generateFrameNames('ENEMY_DEATH', {
                start: 0,
                end: 3,
            }),
            frameRate: 10,
        });
        this.anims.create({
            key: PlayerAnimation.PLAYER_DEATH,
            frames: this.anims.generateFrameNames('PLAYER_DEATH', {
                start: 31,
                end: 40,
            }),
            frameRate: 10,
            repeat: -1,
        });
        this.anims.create({
            key: ASSET_KEYS.POT_BREAK,
            frames: this.anims.generateFrameNames('POT_BREAK', {
                start: 0,
                end: 7,
            }),
            frameRate: 10,
        });

        // list all entries of the animations -> check if it works
        //console.log(this.anims.anims.entries);
    }
}
