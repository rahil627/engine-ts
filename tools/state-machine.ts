export interface State {
    name: string,
    start?: () => any,
    update?: () => any,
    finish?: () => any
}

export class StateMachine
{
    constructor() {};

    private readonly states: { [name: string]: State } = {};
    public currentStateName: string | null = null;

    public reset() {
        const state = this.currentState;
        if(state.finish)
            state.finish();
        this.currentStateName = null;
    };
    
    public addState(state: State) {
        this.states[state.name] = state;
    };
    
    private get currentState(): State {
        return this.states[this.currentStateName];
    };
    
    // forceChange = even if we're already in this state, finish & start it again
    public changeState(stateName: string, forceChange=false) {
        if(!forceChange && stateName === this.currentStateName)
            return;
        if(!(stateName in this.states))
            throw `Cannot change a StateMachine to a state ('${stateName}') that has not been added to it! Available states are: ${Object.keys(this.states).length <= 0 ? 'n/a' : Object.keys(this.states).join(', ')}`
    
        const statePrev = this.currentState;
        const stateNext = this.states[stateName];
        if(statePrev && statePrev.finish)
            statePrev.finish();
        this.currentStateName = stateName;
        if(stateNext && stateNext.start)
            stateNext.start();
    };
    
    public start(initialStateName: string) {
        if(Object.keys(this.states).length <= 0)
            throw "Cannot start a StateMachine which has had no states added to it!";
        this.changeState(initialStateName);
    };
    
    public update() {
        const state = this.currentState;
        if(state && state.update)
            state.update();
    };
}