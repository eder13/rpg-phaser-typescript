import Phaser from 'phaser';
import { SCENE_KEYS } from './scene-keys';

export default class PauseScene extends Phaser.Scene {
    private pausedSceneKey?: string;

    constructor() {
        super({ key: SCENE_KEYS.PAUSE_MENU });
    }

    init(data: { pausedScene?: string }) {
        this.pausedSceneKey = data.pausedScene;
    }

    create() {
        const pausedSceneKey = (this.sys.settings.data as any).pausedScene as string | undefined;
        // pause UI so its timer stops
        if (pausedSceneKey) {
            // pause the UI scene as well (so it receives PAUSE event and pauses its timer)
            this.scene.pause(SCENE_KEYS.UI_SCENE);
        }

        const cam = this.cameras.main;
        const w = cam.width;
        const h = cam.height;

        // halbtransparenter Hintergrund (viewport-gebunden)
        this.add.rectangle(0, 0, w, h, 0x000000, 0.5).setOrigin(0, 0).setScrollFactor(0);

        // Pause-Text
        this.add
            .text(w / 2, h / 2 - 16, 'PAUSED', {
                fontFamily: 'Arial',
                fontSize: '32px',
                color: '#ffffff',
            })
            .setOrigin(0.5)
            .setScrollFactor(0);

        // Instruction
        this.add
            .text(w / 2, h / 2 + 12, 'Press ESC or click to resume', {
                fontFamily: 'Arial',
                fontSize: '12px',
                color: '#cccccc',
            })
            .setOrigin(0.5)
            .setScrollFactor(0);

        // Resume handlers
        this.input?.keyboard?.once('keydown-ESC', () => this.resumePausedScene(), this);
        this.input.once('pointerdown', () => this.resumePausedScene(), this);
    }

    private resumePausedScene() {
        const target = this.pausedSceneKey;
        if (target && this.scene.isPaused(target)) {
            this.scene.resume(target);
        }
        this.sound.resumeAll();
        // resume UI too
        if (this.scene.isPaused(SCENE_KEYS.UI_SCENE)) {
            this.scene.resume(SCENE_KEYS.UI_SCENE);
        }
        this.scene.stop(); // stoppe Pause-Scene
    }
}
