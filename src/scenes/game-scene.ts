import * as Phaser from 'phaser';
import { SCENE_KEYS } from './scene-keys';
import { ASSET_KEYS } from '../common/assets';
import Player from '../game-objects/player/player';
import InputComponent from '../components/input-component/input';
import KeyboardInput from '../components/input-component/keyboard';
import Logger from '../common/logger';
import Spider from '../game-objects/enemies/spider';

export class GameScene extends Phaser.Scene {
    player!: Player;
    spider!: Spider;
    controls!: InputComponent;

    constructor() {
        super({
            key: SCENE_KEYS.GAME_SCENE,
        });
    }

    private initZoom() {
        const dpr = window.devicePixelRatio || 1;
        console.log('#####** dpr', dpr);

        // base zoom
        let zoom = 1;

        // boost zoom on retina
        /* if (dpr >= 2) {
            zoom = 2;
        } */

        this.cameras.main.setZoom(zoom);
    }

    public create(): void {
        this.initZoom();

        if (!this.input.keyboard) {
            Logger.error('Keyboard is not enabled!');
            return;
        }

        this.controls = new KeyboardInput(this.input.keyboard);

        this.player = new Player({
            scene: this,
            position: {
                x: this.scale.width / 2,
                y: this.scale.height / 2,
            },
            assetKey: ASSET_KEYS.PLAYER,
            frame: 0,
            playerMovement: this.controls,
        });

        this.spider = new Spider({
            scene: this,
            position: {
                x: this.scale.width / 2,
                y: this.scale.height / 2 + 50,
            },
            assetKey: ASSET_KEYS.SPIDER,
            frame: 0,
            movement: new InputComponent(),
        });

        this.spider.setCollideWorldBounds(true);
    }

    update(): void {
        this.spider.update();
    }
}
