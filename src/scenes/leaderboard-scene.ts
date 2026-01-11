import * as Phaser from 'phaser';
import { SCENE_KEYS } from './scene-keys';
import KeyboardInput from '../components/input-component/keyboard';
import { ASSET_KEYS } from '../common/assets';

export type LeaderboardEntry = { name: string; time: string };

const MOCK_LEADERBOARD_DATA: LeaderboardEntry[] = [
    { name: 'Player1', time: '1:00' },
    { name: 'Player2', time: '2:00' },
    { name: 'Player3', time: '3:00' },
    { name: 'Player4', time: '4:00' },
    { name: 'Player5', time: '5:00' },
];

export class LeaderboardScene extends Phaser.Scene {
    leaderboardData!: LeaderboardEntry[];
    transitionFromScene!: keyof typeof SCENE_KEYS;
    cursor!: Phaser.GameObjects.Image;
    keyboardInput!: KeyboardInput;

    constructor() {
        super({ key: SCENE_KEYS.LEADERBOARD_SCENE });
    }

    public init(data: { lastScene: keyof typeof SCENE_KEYS }): void {
        this.transitionFromScene = data.lastScene;
    }

    create() {
        if (this.input.keyboard) {
            this.keyboardInput = new KeyboardInput(this.input.keyboard);
        }

        (async () => {
            // Fetch leaderboard data from the server
            const response = await fetch('/api/leaderboard');

            if (!response.ok) {
                console.error('Failed to fetch leaderboard data');
                //return;
            }

            const data = MOCK_LEADERBOARD_DATA; // !response.ok ? MOCK_LEADERBOARD_DATA : await response.json();
            this.leaderboardData = data;

            this.add
                .text(this.scale.width / 2, 32, 'Leaderboard', {
                    fontSize: '32px',
                    align: 'center',
                })
                .setOrigin(0.5);

            this.add
                .text(this.scale.width / 2, 64, 'Top 5 Players', {
                    fontSize: '16px',
                    align: 'center',
                })
                .setOrigin(0.5);

            this.leaderboardData.forEach((entry, index) => {
                this.add
                    .text(this.scale.width / 2, 100 + index * 32, `Name: ${entry.name}        Time: ${entry.time}`, {
                        fontSize: '16px',
                        align: 'center',
                    })
                    .setOrigin(0.5);
            });

            if (this.transitionFromScene === SCENE_KEYS.CONGRATULATIONS) {
                this.showTextAfterCongratulationsScene();
            } else {
                this.showTextAfterStartScene();
            }
        })();
    }

    private showTextAfterCongratulationsScene() {
        this.add
            .text(this.scale.width / 2, 300, 'Restart Game', {
                fontSize: '16px',
                align: 'center',
            })
            .setOrigin(0.5);
    }

    private showTextAfterStartScene() {
        this.cursor = this.add.image(270, 300, ASSET_KEYS.UI_CURSOR).setOrigin(0.5);
        this.add
            .text(this.scale.width / 2, 300, 'Back', {
                fontSize: '16px',
                align: 'center',
            })
            .setOrigin(0.5);
    }

    update(): void {
        if (this.keyboardInput.isEnterKeyDown && this.transitionFromScene !== SCENE_KEYS.CONGRATULATIONS) {
            this.scene.start(SCENE_KEYS.START_SCREEN);
        } else if (this.keyboardInput.isEnterKeyDown && this.transitionFromScene === SCENE_KEYS.CONGRATULATIONS) {
            window.location.reload();
        }
    }
}
