import * as Phaser from 'phaser';
import { PLAYER_HEALTH } from './globals';

export const EVENT_BUS = new Phaser.Events.EventEmitter();

export const Events = {
    OPEN_CHEST: 'OPEN_CHEST',
    ENEMY_DEFEATED: 'ENEMY_DEFEATED',
    PLAYER_DEFEATED: 'PLAYER_DEFEATED',
    PLAYER_HEALTH_CHANGED: 'PLAYER_HEALTH_CHANGED',
    SHOW_DIALOG: 'SHOW_DIALOG',
    HIDE_DIALOG: 'HIDE_DIALOG',
    BOSS_DEFEATED: 'BOSS_DEFEATED',
    FINAL_TIME: 'FINAL_TIME',
} as const;
