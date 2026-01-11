import InputComponent from './input';
import * as Phaser from 'phaser';

class KeyboardInput extends InputComponent {
    cursorKeyboard: Phaser.Types.Input.Keyboard.CursorKeys;
    actionKeyboard: Phaser.Input.Keyboard.Key;
    pauseKeyboard: Phaser.Input.Keyboard.Key;
    enterKeyboard: Phaser.Input.Keyboard.Key;

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
        // Select: Enter
        this.enterKeyboard = keyboardPlugin.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
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
        return Phaser.Input.Keyboard.JustDown(this.cursorKeyboard.space);
    }

    get isActionKeyDown(): boolean {
        return Phaser.Input.Keyboard.JustDown(this.actionKeyboard);
    }

    get isPauseKeyDown(): boolean {
        return Phaser.Input.Keyboard.JustDown(this.pauseKeyboard);
    }

    get isEnterKeyDown(): boolean {
        return Phaser.Input.Keyboard.JustDown(this.enterKeyboard);
    }
}

export default KeyboardInput;
