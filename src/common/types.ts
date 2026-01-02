import { PlayerAnimation } from './assets';
import { CHEST_STATE, INTERACTIVE_OBJECT_TYPE } from './globals';

export type CharacterAnimation = keyof typeof PlayerAnimation;

export type Position = {
    x: number;
    y: number;
};

export type GameObject = Phaser.GameObjects.Sprite | Phaser.GameObjects.Image;

export type ChestState = keyof typeof CHEST_STATE;

export type InteractiveObjectType = keyof typeof INTERACTIVE_OBJECT_TYPE;

export interface CustomGameObject {
    enableObject(): void;
    disableObject(): void;
}

export function isCustomGameObject(object: any): object is CustomGameObject {
    return object && typeof object.enableObject === 'function' && typeof object.disableObject === 'function';
}
