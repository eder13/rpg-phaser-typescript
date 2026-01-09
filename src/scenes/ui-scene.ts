import * as Phaser from 'phaser';
import { SCENE_KEYS } from './scene-keys';
import { ASSET_KEYS, ASSET_PACK_KEYS, PlayerAnimation } from '../common/assets';
import { LEVEL_NAME, PLAYER_HEALTH } from '../common/globals';
import { LevelData } from '../common/types';
import DataManager from '../components/data-manager/DataManager';
import { EVENT_BUS, Events } from '../common/events';
import Logger from '../common/logger';

enum HeartsFrame {
    FULL = 0,
    HALF = 1,
    EMPTY = 2,
}

export class UIScene extends Phaser.Scene {
    hudContainer!: Phaser.GameObjects.Container;
    hearts!: Phaser.GameObjects.Sprite[];

    constructor() {
        super({
            key: SCENE_KEYS.UI_SCENE,
        });
    }

    public create(): void {
        this.hudContainer = this.add.container(0, 0, []);
        this.hearts = [];

        const numberOfHearts = DataManager.getInstance().maxLives / 2;
        const numberOfFullHearts = Math.floor(DataManager.getInstance()._currentLives / 2);
        const hasHalfHeart = DataManager.getInstance()._currentLives % 2 === 1;

        for (let i = 0; i < numberOfHearts; i += 1) {
            let x = 460 + 24 * i;
            let y = 6;
            if (i >= 10) {
                x = 500 + 24 * (i - 10);
                y = 33;
            }
            let frame = HeartsFrame.EMPTY;

            if (i < numberOfFullHearts) {
                frame = HeartsFrame.FULL;
            } else if (hasHalfHeart && i === numberOfFullHearts) {
                frame = HeartsFrame.HALF;
            }

            const heart = this.add.sprite(x, y, ASSET_KEYS.UI_HEARTBARS, frame);
            heart.setOrigin(0, 0);
            this.hudContainer.add(heart);
            this.hearts.push(heart);
        }

        EVENT_BUS.on(
            Events.PLAYER_HEALTH_CHANGED,
            (health: number) => {
                Logger.info(`[event]: ${Events.PLAYER_HEALTH_CHANGED}, args=${health}`);

                const numberOfFullHearts = Math.floor(health / 2);
                const hasHalfHeart = health % 2 === 1;

                this.hearts.forEach((heart, index) => {
                    let frame = HeartsFrame.EMPTY;
                    if (index < numberOfFullHearts) {
                        frame = HeartsFrame.FULL;
                    } else if (hasHalfHeart && index === numberOfFullHearts) {
                        frame = HeartsFrame.HALF;
                    }
                    heart.setFrame(frame);
                });
            },
            this,
        );
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            EVENT_BUS.off(Events.PLAYER_HEALTH_CHANGED, () => {}, this);
        });
    }
}
