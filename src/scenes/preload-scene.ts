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
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;
        const boxW = Math.min(400, w - 40);
        const boxH = 30;
        const boxX = (w - boxW) / 2;
        const boxY = (h - boxH) / 2;

        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(boxX - 4, boxY - 4, boxW + 8, boxH + 32);

        const progressBar = this.add.graphics();
        const percentText = this.add
            .text(w / 2, boxY + boxH + 4, '0%', { fontSize: '12px', color: '#ffffff' })
            .setOrigin(0.5, 0);
        const fileText = this.add
            .text(w / 2, boxY + boxH + 18, '', { fontSize: '10px', color: '#cccccc' })
            .setOrigin(0.5, 0);

        this.load.on('progress', (value: number) => {
            progressBar.clear();
            progressBar.fillStyle(0x88e453, 1);
            progressBar.fillRect(boxX, boxY, boxW * value, boxH);
            percentText.setText(Math.round(value * 100) + '%');
        });

        this.load.on('fileprogress', (file: Phaser.Loader.File) => {
            fileText.setText(`Loading: ${file.key || file.src || ''}`);
        });

        this.load.on('complete', () => {
            // cleanup
            progressBar.destroy();
            progressBox.destroy();
            percentText.destroy();
            fileText.destroy();
            // remove listeners to avoid leaks (important if you ever restart this scene)
            this.load.off('progress');
            this.load.off('fileprogress');
            this.load.off('complete');
            // continue to next scene
            this.createAnimations();
            this.scene.start(SCENE_KEYS.START_SCREEN);
        });

        // start loading asset pack (events above will update the UI)
        this.load.pack(ASSET_PACK_KEYS.MAIN, 'assets/data/assets.json');
    }

    public create(): void {
        this.createAnimations();
        this.scene.start(SCENE_KEYS.START_SCREEN);
    }

    createAnimations() {
        this.anims.createFromAseprite(ASSET_KEYS.PLAYER);
        this.anims.createFromAseprite(ASSET_KEYS.SPIDER);
        this.anims.createFromAseprite(ASSET_KEYS.SAW);
        this.anims.createFromAseprite(ASSET_KEYS.FIRE);
        this.anims.createFromAseprite(ASSET_KEYS.SPIKE);
        this.anims.createFromAseprite(ASSET_KEYS.BLOB);
        this.anims.createFromAseprite(ASSET_KEYS.SPIDER_RED);
        this.anims.createFromAseprite(ASSET_KEYS.PLAYER_ATTACK);
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
    }
}
