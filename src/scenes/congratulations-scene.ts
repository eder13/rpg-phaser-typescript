import Phaser from 'phaser';
import { SCENE_KEYS } from './scene-keys';
import DataManager from '../components/data-manager/data-manager';
import { LeaderboardEntry } from './leaderboard-scene';

export default class CongratulationsScene extends Phaser.Scene {
    private nameInput?: Phaser.GameObjects.DOMElement;
    private submitBtn?: Phaser.GameObjects.Text;
    private errorPosingLeaderBoardText?: Phaser.GameObjects.Text;
    private finalTime = '0.000';

    constructor() {
        super({ key: SCENE_KEYS.CONGRATULATIONS });
    }

    create() {
        // optional: zeige bereits bekannten final time falls vorhanden
        this.finalTime = (DataManager.getInstance().time as string) ?? this.finalTime;

        const cam = this.cameras.main;
        const w = cam.width;
        const h = cam.height;

        // Congratulations-Text
        this.add
            .text(w / 2, h / 2 - 16, 'Congratulations! You won!', {
                fontFamily: 'Arial',
                fontSize: '32px',
                color: '#ffffff',
            })
            .setOrigin(0.5)
            .setScrollFactor(0);
        this.add
            .text(w / 2, h / 2 + 16, 'Your Final Time: ' + DataManager.getInstance().time, {
                fontFamily: 'Arial',
                fontSize: '16px',
                color: '#ffffff',
            })
            .setOrigin(0.5)
            .setScrollFactor(0);
        this.add
            .text(w / 2, h / 2 + 32, 'Enter your name for the leaderboard:', {
                fontFamily: 'Arial',
                fontSize: '16px',
                color: '#ffffff',
            })
            .setOrigin(0.5)
            .setScrollFactor(0);

        // HTML input per Phaser DOM
        this.nameInput = this.add.dom(
            w / 2,
            h / 2 + 70,
            'input',
            {
                type: 'text',
                name: 'playerName',
                placeholder: 'Your name',
                fontSize: '16px',
                padding: '6px',
                width: '220px',
                outline: 'none',
                border: '1px solid #888',
                borderRadius: '4px',
                background: '#111',
                color: '#fff',
                textAlign: 'center',
            },
            '',
        );
        this.nameInput.setOrigin(0.5).setScrollFactor(0);

        // ensure keyboard/game input is disabled while typing
        const inputEl = this.nameInput.node as HTMLInputElement;
        const disablePhaserKeyboard = () => {
            // disable Phaser keyboard processing so game hotkeys don't fire
            if (this.input && this.input.keyboard) this.input.keyboard.enabled = false;
        };
        const enablePhaserKeyboard = () => {
            if (this.input && this.input.keyboard) this.input.keyboard.enabled = true;
        };

        // stop propagation so keydown events don't bubble to Phaser
        const stopPropagation = (e: Event) => {
            (e as KeyboardEvent).stopPropagation?.();
        };

        inputEl.addEventListener('focus', disablePhaserKeyboard);
        inputEl.addEventListener('blur', enablePhaserKeyboard);
        inputEl.addEventListener('keydown', stopPropagation);
        inputEl.addEventListener('keyup', stopPropagation);

        // optionally focus the input when clicking the DOM element
        this.nameInput.addListener('pointerdown');
        this.nameInput.on(
            'pointerdown',
            () => {
                inputEl.focus();
            },
            this,
        );

        // clean up listeners on shutdown
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            inputEl.removeEventListener('focus', disablePhaserKeyboard);
            inputEl.removeEventListener('blur', enablePhaserKeyboard);
            inputEl.removeEventListener('keydown', stopPropagation);
            inputEl.removeEventListener('keyup', stopPropagation);
        });

        // Submit-Button (Phaser Text)
        this.submitBtn = this.add
            .text(w / 2, h / 2 + 100, 'Submit', { fontSize: '14px', color: '#ffffff', backgroundColor: '#333' })
            .setOrigin(0.5)
            .setInteractive()
            .setScrollFactor(0);

        this.errorPosingLeaderBoardText = this.add
            .text(w / 2, h / 2 + 120, 'Error submitting your score. Please try again.', {
                fontSize: '14px',
                color: '#ff0000',
            })
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setVisible(false);

        const doSubmit = () => {
            const el = this.nameInput?.node as HTMLInputElement | undefined;
            if (!el) return;
            const name = el.value.trim();
            if (!name) return;
            const finalTime = this.finalTime;
            console.log('submit name', name, 'time', finalTime);

            fetch('/api/leaderboard', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, finalTime }),
            })
                .then((response) => {
                    if (response.ok) {
                        this.scene.start(SCENE_KEYS.LEADERBOARD_SCENE, { lastScene: SCENE_KEYS.CONGRATULATIONS });
                        this.errorPosingLeaderBoardText?.setVisible(false);

                        this.nameInput?.destroy();
                        this.submitBtn?.destroy();
                        this.errorPosingLeaderBoardText?.destroy();
                    } else {
                        throw new Error('Failed to submit score');
                    }
                })
                .catch((error) => {
                    this.errorPosingLeaderBoardText?.setVisible(true);
                });
        };

        // click auf Button
        this.submitBtn.on('pointerdown', doSubmit, this);

        // Enter-Taste im HTML-Input
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Enter') doSubmit();
        };
        inputEl.addEventListener('keydown', onKey);

        // entferne Listener beim Shutdown
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            inputEl.removeEventListener('keydown', onKey);
        });
    }

    update(time: number, delta: number): void {}
}
