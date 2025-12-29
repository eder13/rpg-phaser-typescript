import * as Phaser from 'phaser';
import { GameObject } from '../../common/types';

class BaseGameObject {
    protected scene!: Phaser.Scene;
    protected gameObject!: GameObject;

    constructor(game: GameObject) {
        this.scene = game.scene;
        this.gameObject = game;
    }

    static getComponent<T>(gameObject: GameObject): T {
        return gameObject[`_${this.name}_`] as T;
    }

    static remove(gameObject: GameObject) {
        delete gameObject[`_${this.name}_`];
    }

    protected assignComponentToObject(object: GameObject) {
        object[`_${this.constructor.name}_`] = this;
    }
}

export default BaseGameObject;
