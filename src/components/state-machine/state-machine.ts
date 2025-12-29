import Logger from '../../common/logger';

export interface State {
    stateMachine: StateMachine;
    name: string;
    onEnter?: (args: unknown[]) => void;
    onExit?: () => void;
    onUpdate?: (args?: unknown[]) => void;
}

class StateMachine {
    id: string;
    states: Map<string, State> = new Map();
    currentState: State | undefined;
    isChangingState: boolean;
    changingStateQueue: { state: string; args: any[] }[] = [];

    constructor(id?: string) {
        if (id) {
            this.id = id;
        } else {
            this.id = `state-machine-${Math.random().toString(36).substr(2, 9)}`;
        }
        this.currentState = undefined;
        this.isChangingState = false;
    }

    update(args?: unknown[]) {
        if (this.currentState && this.currentState?.onUpdate) {
            this.currentState.onUpdate(args);
        }

        const queueState = this.changingStateQueue.shift();
        if (queueState) {
            this.setState(queueState.state, ...queueState.args);
            return;
        }
    }

    public setState(state: string, ...args: any[]) {
        if (!this.states.has(state)) {
            Logger.error(`State "${state}" does not exist.`);
            return;
        }

        const currentState = this.states.get(this?.currentState?.name ?? '');
        if (currentState?.name === state) {
            Logger.warn(`State "${state}" is already active.`);
            return;
        }

        if (this.isChangingState) {
            this.changingStateQueue.push({ state, args });
            return;
        }

        this.isChangingState = true;
        Logger.info(`StateMachine "${this.currentState?.name}" changing state to "${state}".`);
        this.currentState = this.states.get(state);

        if (this.currentState?.onEnter) {
            this.currentState.onEnter(args);
        }

        this.isChangingState = false;
    }

    public addState(state: State) {
        state.stateMachine = this;
        this.states.set(state.name, state);
    }
}

export default StateMachine;
