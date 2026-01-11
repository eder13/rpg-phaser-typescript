import * as Phaser from 'phaser';
import { SCENE_KEYS } from './scene-keys';
import { ASSET_KEYS } from '../common/assets';
import KeyboardInput from '../components/input-component/keyboard';
import DataManager from '../components/data-manager/data-manager';
import { LevelData } from '../common/types';
import { LEVEL_NAME } from '../common/globals';
import InventoryManager from '../components/inventory/inventory';

export class StartScreen extends Phaser.Scene {
    cursor!: Phaser.GameObjects.Image;
    keyboardInput!: KeyboardInput;
    menuOptionIndex: number = 0;

    constructor() {
        super({
            key: SCENE_KEYS.START_SCREEN,
        });
    }

    public create(): void {
        this.add
            .text(this.scale.width / 2, 100, 'Dungeon Adventure', {
                fontSize: '32px',
                align: 'center',
            })
            .setOrigin(0.5);

        this.add
            .text(this.scale.width / 2, 180, 'Controls:', {
                fontSize: '16px',
                align: 'center',
            })
            .setOrigin(0.5);
        this.add
            .text(this.scale.width / 2, 200, 'Arrow keys to move, Space to attack ', {
                fontSize: '16px',
                align: 'center',
            })
            .setOrigin(0.5);
        this.add
            .text(this.scale.width / 2, 220, 'E + Arrow keys to interact, ESC Pause, Enter Select', {
                fontSize: '16px',
                align: 'center',
            })
            .setOrigin(0.5);
        this.add
            .text(this.scale.width / 2, 300, 'Start', {
                fontSize: '16px',
                align: 'center',
            })
            .setOrigin(0.5);

        this.add
            .text(this.scale.width / 2, 320, 'Leaderboard', {
                fontSize: '16px',
                align: 'center',
            })
            .setOrigin(0.5);

        this.cursor = this.add.image(230, 320, ASSET_KEYS.UI_CURSOR).setOrigin(0.5);

        if (this.input.keyboard) {
            this.keyboardInput = new KeyboardInput(this.input.keyboard);
        }
    }

    update(): void {
        if (this.keyboardInput.isUpDown) {
            this.menuOptionIndex = Phaser.Math.Clamp(this.menuOptionIndex - 1, 0, 1);
        } else if (this.keyboardInput.isDownDown) {
            this.menuOptionIndex = Phaser.Math.Clamp(this.menuOptionIndex + 1, 0, 1);
        }

        if (
            (this.menuOptionIndex === 0 && this.keyboardInput.isEnterKeyDown) ||
            window.location.search.includes('skipStartScreen=true')
        ) {
            DataManager.getInstance().reset();
            InventoryManager.getInstance().reset();

            const levelData: LevelData = {
                level: LEVEL_NAME.DUNGEON_1,
                doorId: 1,
                roomId: 3,
            };

            this.scene.start(SCENE_KEYS.GAME_SCENE, levelData);
        } else if (this.keyboardInput.isEnterKeyDown && this.menuOptionIndex === 1) {
            this.scene.start(SCENE_KEYS.LEADERBOARD_SCENE);
        }

        this.cursor.y = 300 + this.menuOptionIndex * 20;
    }
}
