import * as Phaser from 'phaser';
import { PLAYER_HEALTH } from './globals';

export const EVENT_BUS = new Phaser.Events.EventEmitter();

export const Events = {
    OPEN_CHEST: 'OPEN_CHEST',
    ENEMY_DEFEATED: 'ENEMY_DEFEATED',
    PLAYER_HEALTH_CHANGED: 'PLAYER_HEALTH_CHANGED',
} as const;
