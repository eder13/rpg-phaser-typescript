import { PlayerAnimation } from '../../../../common/assets';
import { DIRECTION } from '../../../../common/globals';
import Player from '../../../../game-objects/player/player';
import BasePlayerState from './base-player-state';
import { PlayerStates } from '../states';
import { Chest } from '../../../../game-objects/objects/chest';
import { EVENT_BUS, Events } from '../../../../common/events';

class OpenChestState extends BasePlayerState {
    constructor(gameObject: Player) {
        super(PlayerStates.OPEN_CHEST, gameObject);
    }

    onEnter(args: any): void {
        const chest = args?.[0] as Chest;
        console.log('#####** chest', chest);

        if (this.gameObject.body) {
            this.gameObject.body.velocity.x = 0;
            this.gameObject.body.velocity.y = 0;
        }

        EVENT_BUS.emit(Events.OPEN_CHEST, chest);

        this.gameObject.stateMachine.setState(PlayerStates.IDLE, DIRECTION);
    }

    onUpdate(args?: unknown[]) {}

    onExit() {
        super.onExit();
        // Handle exiting the idle state
    }
}

export default OpenChestState;
