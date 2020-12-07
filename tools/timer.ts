import { clamp } from '@engine-ts/core/utils';

export class Timer {
    public value: number = 0;
    public triggered: boolean = false; // whether or not the timer's value has crossed from < 1 to >= 1 this frame
    public started: boolean = false; // whether or not the timer has had its .update() method called at least once
    public paused: boolean = false;

    protected clean(valueRaw: number): number { return clamp(valueRaw, 0, 1); }

    public get finished(): boolean { return this.value >= 1; }
    public toRange(min: number, max: number) { return (max - min) * this.value + min; }
    
    constructor(public seconds: number=1) {}

    public reset(seconds: number=this.seconds): void {
        this.seconds = seconds;
        this.value = this.seconds === 0 ? 1 : 0;
        this.triggered = false;
        this.started = false;
        this.paused = false;
    }

    // deltaMs == world.delta
    public update(deltaMs: number) {
        if(this.paused)
            return;
        const valueLast = this.value;
        this.value = this.clean(this.seconds > 0 ? this.value + deltaMs / 1000 / this.seconds : 1);
        this.triggered = this.value >= 1 && valueLast < 1;
        this.started = true;
    }
}

export class LoopTimer extends Timer {
    protected clean(valueRaw: number): number { return valueRaw % 1; }
    public get finished(): boolean { return false; }
}