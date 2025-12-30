import * as Phaser from 'phaser';

export const EVENT_BUS = new Phaser.Events.EventEmitter();

export const Events = {
    OPEN_CHEST: 'OPEN_ECHEST',
} as const;
