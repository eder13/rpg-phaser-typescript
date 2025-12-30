import Saw from '../../../../game-objects/enemies/saw';
import Spider from '../../../../game-objects/enemies/spider';
import Player from '../../../../game-objects/player/player';
import StateMachine, { State } from '../../state-machine';

class BasePlayerState implements State {
    stateMachine!: StateMachine;
    name: string;
    gameObject: Player | Spider | Saw;

    constructor(name: string, gameObject: Player | Spider | Saw) {
        this.name = name;
        this.gameObject = gameObject;
    }

    get getName() {
        return this.name;
    }

    set setStateMachine(stateMachine: StateMachine) {
        this.stateMachine = stateMachine;
    }

    onEnter(args) {
        // Handle entering the state
    }

    onExit() {
        // Handle exiting the state
    }

    onUpdate() {
        // Handle updating the state
    }
}

export default BasePlayerState;
