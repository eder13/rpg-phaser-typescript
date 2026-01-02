import { SPIDER_ANIMATION_KEYS } from '../../../../common/assets';
import Spider from '../../../../game-objects/enemies/spider';
import BasePlayerState from '../player/base-player-state';
import { SpiderStates } from '../states';

class DeathStateSpider extends BasePlayerState {
    onDieCallback: () => void;

    constructor(gameObject: Spider, onDieCallback: () => void) {
        super(SpiderStates.DEATH, gameObject);
        this.onDieCallback = onDieCallback;
    }

    onEnter(args?: unknown[]) {
        this.gameObject.updateVelocity(true, 0);
        this.gameObject.updateVelocity(false, 0);

        this.gameObject.invulnerableComponent.invulnerable = true;

        this.gameObject.play({
            key: SPIDER_ANIMATION_KEYS.DEATH,
            repeat: 0,
        });

        this.gameObject.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
            console.log('Die Animation is done');
            this.onDefeat();
        });
    }

    onExit() {
        super.onExit();
        // Handle exiting the idle state
    }

    onDefeat() {
        (this.gameObject as Spider).disableObject();
        this.onDieCallback();
    }

    onUpdate(args?: unknown[]) {}
}

export default DeathStateSpider;
