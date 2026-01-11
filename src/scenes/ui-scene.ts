import * as Phaser from 'phaser';
import { SCENE_KEYS } from './scene-keys';
import { ASSET_KEYS, ASSET_PACK_KEYS, PlayerAnimation } from '../common/assets';
import { LEVEL_NAME, PLAYER_HEALTH } from '../common/globals';
import { LevelData } from '../common/types';
import DataManager from '../components/data-manager/data-manager';
import { EVENT_BUS, Events } from '../common/events';
import Logger from '../common/logger';

enum HeartsFrame {
    FULL = 0,
    HALF = 1,
    EMPTY = 2,
}

export class UIScene extends Phaser.Scene {
    private timerEvent?: Phaser.Time.TimerEvent;
    private startTime = 0;
    private elapsedBase = 0; // bereits akkumulierte Zeit vor Pause
    private running = true;
    private elapsedTimeText = '0.000';
    hudContainer!: Phaser.GameObjects.Container;
    hearts!: Phaser.GameObjects.Sprite[];
    dialogContainer!: Phaser.GameObjects.Container;
    dialogContainerText!: Phaser.GameObjects.Text;

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

        // show timer
        const timerText = this.add
            .text(16, 16, 'Time: 0.000', {
                fontSize: '8px',
            })
            .setOrigin(0, 0)
            .setScrollFactor(0);

        // helper functions
        const pad2 = (v: number) => v.toString().padStart(2, '0');
        const pad3 = (v: number) => v.toString().padStart(3, '0');
        const format = (ms: number) => {
            const totalMs = Math.max(0, Math.floor(ms));
            const minutes = Math.floor(totalMs / 60000);
            const seconds = Math.floor((totalMs % 60000) / 1000);
            const millis = totalMs % 1000;
            if (minutes > 0) {
                return `${minutes}:${pad2(seconds)}.${pad3(millis)}`;
            }
            return `${seconds}.${pad3(millis)}s`;
        };

        // init
        this.startTime = this.time.now;
        this.elapsedBase = 0;
        this.running = true;

        // TimerEvent aktualisiert das Textfeld, aber nur wenn running==true
        this.timerEvent = this.time.addEvent({
            delay: 50,
            loop: true,
            callback: () => {
                const elapsed = this.elapsedBase + (this.running ? this.time.now - this.startTime : 0);
                this.elapsedTimeText = format(elapsed);
                timerText.setText(`Time: ${this.elapsedTimeText}`);
                DataManager.getInstance().time = this.elapsedTimeText;
            },
        });

        // Reagiere auf Scene lifecycle damit Pause/Resume funktioniert
        this.events.on(Phaser.Scenes.Events.PAUSE, () => this.pauseTimer());
        this.events.on(Phaser.Scenes.Events.RESUME, () => this.resumeTimer());
        this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => this.shutdownTimer());

        EVENT_BUS.on(
            Events.BOSS_DEFEATED,
            () => {
                Logger.info(`[event]: ${Events.BOSS_DEFEATED}`);
                this.pauseTimer();
                Logger.info(`[UI Scene] Final Time: ${this.elapsedTimeText}`);

                DataManager.getInstance().time = this.elapsedTimeText;
            },
            this,
        );
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            EVENT_BUS.off(Events.BOSS_DEFEATED, () => {}, this);
        });

        EVENT_BUS.on(
            Events.SHOW_DIALOG,
            (message: string) => {
                Logger.info(`[event]: ${Events.SHOW_DIALOG}, args=${message}`);
                this.dialogContainer.setVisible(true);
                this.dialogContainerText.setText(message);
            },
            this,
        );
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            EVENT_BUS.off(Events.SHOW_DIALOG, () => {}, this);
        });

        EVENT_BUS.on(
            Events.HIDE_DIALOG,
            () => {
                Logger.info(`[event]: ${Events.HIDE_DIALOG}`);
                this.dialogContainerText.setText('');
                this.dialogContainer.setVisible(false);
            },
            this,
        );
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            EVENT_BUS.off(Events.HIDE_DIALOG, () => {}, this);
        });

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

        this.dialogContainer = this.add.container(32, 142, [
            this.add.image(this.scale.width / 2 - 30, 110, ASSET_KEYS.UI_DIALOG).setOrigin(0.5, 0),
        ]);
        this.dialogContainerText = this.add
            .text(this.scale.width / 2 - 114, 124, 'You found the boss key!', {
                fontSize: '16px',
                wordWrap: { width: 190 },
                align: 'center',
            })
            .setOrigin(0, 0);
        this.dialogContainer.add(this.dialogContainerText);

        this.dialogContainer.setVisible(false);
    }

    private pauseTimer() {
        if (!this.running) return;
        // akkumulierte Zeit updaten und stoppen
        this.elapsedBase += this.time.now - this.startTime;
        this.running = false;
    }

    private resumeTimer() {
        if (this.running) return;
        this.startTime = this.time.now;
        this.running = true;
    }

    private shutdownTimer() {
        if (this.timerEvent) {
            this.timerEvent.remove(false);
            this.timerEvent = undefined;
        }
        this.running = false;
    }

    // public API: reset timer (z.B. beim Respawn / GameOver)
    public resetTimer() {
        this.elapsedBase = 0;
        this.startTime = this.time.now;
        this.running = true;
    }
}
