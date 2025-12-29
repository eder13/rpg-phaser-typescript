import { GameObject } from '../../common/types';
import InputComponent from '../input-component/input';
import BaseGameObject from './base-game-object-component';

class VirtualControlsComponent extends BaseGameObject {
    private inputComponent: InputComponent;

    constructor(game: GameObject, input: InputComponent) {
        super(game);
        this.inputComponent = input;
    }

    get controls() {
        return this.inputComponent;
    }
}

export default VirtualControlsComponent;
