class InputComponent {
    private left = false;
    private right = false;
    private down = false;
    private up = false;
    private attackKey = false;
    private actionKey = false;
    private pauseKey = false;

    constructor() {}

    get isLeftDown() {
        return this.left;
    }

    set isLeftDown(val: boolean) {
        this.left = val;
    }

    get isRightDown() {
        return this.right;
    }

    set isRightDown(val: boolean) {
        this.right = val;
    }

    get isDownDown() {
        return this.down;
    }

    // for not continious pressing i.e. menu control
    get isDownJustDown() {
        return this.down;
    }

    set isDownDown(val: boolean) {
        this.down = val;
    }

    get isUpDown() {
        return this.up;
    }

    set isUpDown(val: boolean) {
        this.up = val;
    }

    // for not continious pressing i.e. menu control
    get isUpJustDown() {
        return this.up;
    }

    get isAttackKeyDown() {
        return this.attackKey;
    }

    set isAttackKeyDown(val: boolean) {
        this.attackKey = val;
    }

    get isActionKeyDown() {
        return this.actionKey;
    }

    set isActionKeyDown(val: boolean) {
        this.actionKey = val;
    }

    get isPauseKeyDown() {
        return this.pauseKey;
    }

    set isPauseKeyDown(val: boolean) {
        this.pauseKey = val;
    }

    public reset() {
        this.left = false;
        this.right = false;
        this.down = false;
        this.up = false;
        this.attackKey = false;
        this.actionKey = false;
        this.pauseKey = false;
    }
}

export default InputComponent;
