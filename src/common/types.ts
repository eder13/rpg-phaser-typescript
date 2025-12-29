import Player from '../game-objects/player/player';
import { PlayerAnimation } from './assets';

export type CharacterAnimation = keyof typeof PlayerAnimation;

export type Position = {
    x: number;
    y: number;
};

export type GameObject = Phaser.GameObjects.Sprite | Phaser.GameObjects.Image;
