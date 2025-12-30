import { GameObject } from '../../common/types';
import BaseGameObject from './base-game-object-component';

class InvulnerableComponent extends BaseGameObject {
    private isInvulnerable: boolean = false;
    private invulnerableDuration: number = 0;

    constructor(gameObject: GameObject, invulnerable: boolean = false, duration: number = 0) {
        super(gameObject);
        this.isInvulnerable = invulnerable;
        this.invulnerableDuration = duration;
    }

    public set invulnerable(value: boolean) {
        this.isInvulnerable = value;
    }

    public set duration(value: number) {
        this.invulnerableDuration = value;
    }

    public get invulnerable(): boolean {
        return this.isInvulnerable;
    }

    public get duration(): number {
        return this.invulnerableDuration;
    }
}

export default InvulnerableComponent;
