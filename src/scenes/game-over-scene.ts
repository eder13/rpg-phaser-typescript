import * as Phaser from 'phaser';
import { SCENE_KEYS } from './scene-keys';
import { ASSET_KEYS } from '../common/assets';
import KeyboardInput from '../components/input-component/keyboard';
import DataManager from '../components/data-manager/data-manager';
import { LevelData } from '../common/types';
import { LEVEL_NAME } from '../common/globals';
import InventoryManager from '../components/inventory/inventory';

export class GameOverScene extends Phaser.Scene {
    cursor!: Phaser.GameObjects.Image;
    keyboardInput!: KeyboardInput;
    menuOptionIndex: number = 0;

    constructor() {
        super({
            key: SCENE_KEYS.GAME_OVER_SCENE,
        });
    }

    public create(): void {
        this.add
            .text(this.scale.width / 2, 100, 'Game Over', {
                fontSize: '32px',
                align: 'center',
            })
            .setOrigin(0.5);

        this.add
            .text(this.scale.width / 2, 300, 'Restart', {
                fontSize: '16px',
                align: 'center',
            })
            .setOrigin(0.5);
        this.add
            .text(this.scale.width / 2, 320, 'Quit', {
                fontSize: '16px',
                align: 'center',
            })
            .setOrigin(0.5);

        this.cursor = this.add.image(270, 300, ASSET_KEYS.UI_CURSOR).setOrigin(0.5);

        if (this.input.keyboard) {
            this.keyboardInput = new KeyboardInput(this.input.keyboard);
        }

        console.log('#####** time until death:', DataManager.getInstance().time);
    }

    update(): void {
        if (this.keyboardInput.isUpDown) {
            this.menuOptionIndex = Phaser.Math.Clamp(this.menuOptionIndex - 1, 0, 1);
        } else if (this.keyboardInput.isDownDown) {
            this.menuOptionIndex = Phaser.Math.Clamp(this.menuOptionIndex + 1, 0, 1);
        }

        if (this.keyboardInput.isEnterKeyDown) {
            if (this.menuOptionIndex === 0) {
                window.location.href = '?skipStartScreen=true';
            } else if (this.menuOptionIndex === 1) {
                window.close();
            }
        }

        this.cursor.y = 300 + this.menuOptionIndex * 20;
    }
}
