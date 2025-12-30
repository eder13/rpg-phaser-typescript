import { GameObject } from '../../common/types';
import Player from '../../game-objects/player/player';
import BaseGameObject from './base-game-object-component';

class LifeComponent extends BaseGameObject {
    private _maxLives: number;
    private _currentLives: number;

    constructor(gameObject: GameObject, maxLives: number) {
        super(gameObject);
        this._maxLives = maxLives;
        this._currentLives = maxLives;
    }

    public takeDamage(damage: number): void {
        this._currentLives -= damage;
        if (this._currentLives < 0) {
            this._currentLives = 0;
        }
    }

    public gainLife(): void {
        this._currentLives++;
        if (this._currentLives > this._maxLives) {
            this._currentLives = this._maxLives;
        }
    }

    public get currentLives(): number {
        return this._currentLives;
    }

    public get maxLives(): number {
        return this._maxLives;
    }
}

export default LifeComponent;
