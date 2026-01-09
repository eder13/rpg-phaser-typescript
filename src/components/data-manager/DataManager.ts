import { EVENT_BUS, Events } from '../../common/events';
import { PLAYER_HEALTH } from '../../common/globals';

class DataManager {
    private static instance: DataManager;
    _maxLives: number = PLAYER_HEALTH;
    _currentLives: number = PLAYER_HEALTH;

    static getInstance(): DataManager {
        if (!DataManager.instance) {
            DataManager.instance = new DataManager();
        }
        return DataManager.instance;
    }

    get maxLives(): number {
        return this._maxLives;
    }

    public reset(): void {
        this._currentLives = this._maxLives;
    }

    public loseLife(amount: number): void {
        this._currentLives -= amount;
        if (this._currentLives < 0) {
            this._currentLives = 0;
        }

        EVENT_BUS.emit(Events.PLAYER_HEALTH_CHANGED, this._currentLives);
    }
}

export default DataManager;
