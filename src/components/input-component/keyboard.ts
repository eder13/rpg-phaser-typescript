import InputComponent from './input';
import * as Phaser from 'phaser';

class KeyboardInput extends InputComponent {
    cursorKeyboard: Phaser.Types.Input.Keyboard.CursorKeys;
    actionKeyboard: Phaser.Input.Keyboard.Key;
    pauseKeyboard: Phaser.Input.Keyboard.Key;

    constructor(keyboardPlugin: Phaser.Input.Keyboard.KeyboardPlugin) {
        super();

        // Movement       Space: Attack
        // ^ | <- ->
        // | v
        this.cursorKeyboard = keyboardPlugin.createCursorKeys();
        // Action: E
        this.actionKeyboard = keyboardPlugin.addKey(Phaser.Input.Keyboard.KeyCodes.E);
        // Pause: Escape
        this.pauseKeyboard = keyboardPlugin.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    }

    get isUpDown(): boolean {
        return this.cursorKeyboard.up.isDown;
    }

    get isUpJustDown(): boolean {
        return Phaser.Input.Keyboard.JustDown(this.cursorKeyboard.up);
    }

    get isDownDown(): boolean {
        return this.cursorKeyboard.down.isDown;
    }

    get isDownJustDown(): boolean {
        return Phaser.Input.Keyboard.JustDown(this.cursorKeyboard.down);
    }

    get isLeftDown(): boolean {
        return this.cursorKeyboard.left.isDown;
    }

    get isRightDown(): boolean {
        return this.cursorKeyboard.right.isDown;
    }

    get isAttackKeyDown(): boolean {
        return this.cursorKeyboard.space.isDown;
    }

    get isActionKeyDown(): boolean {
        return Phaser.Input.Keyboard.JustDown(this.actionKeyboard);
    }

    get isPauseKeyDown(): boolean {
        return Phaser.Input.Keyboard.JustDown(this.pauseKeyboard);
    }
}

export default KeyboardInput;
