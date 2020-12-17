import { moduloSafe, random } from '@engine-ts/core/utils';
import { World } from '@engine-ts/core/world';
import { Geometry } from '@engine-ts/geometry/geometry';
import { IPoint } from '@engine-ts/geometry/interfaces';
import { LoopTimer, Timer } from '@engine-ts/tools/timer';
import { Draw } from './draw';

export interface ISpriteFrame {
    indices: IPoint,
    timeWeight: number,
}

export class SpriteAnimation {
    private readonly timer: Timer;
    private readonly timeWeightTotal: number;
    public get seconds(): number { return this.timer.seconds; }
    public get completion(): number { return this.timer.value; }
    public set completion(value: number) { this.timer.value = moduloSafe(value, 1);}

    constructor(
        private readonly frames: ISpriteFrame[],
        seconds: number,
        loop: boolean = true,
    ) {
        this.timer = loop ? new LoopTimer(seconds) : new Timer(seconds);
        this.timeWeightTotal = this.frames.sumOf(o => o.timeWeight);
    }

    public get finished(): boolean { return this.timer.finished; }

    update(deltaMs: number) {
        this.timer.update(deltaMs);
    }

    reset() {
        this.timer.reset();
    }

    randomize() {
        this.timer.value = random();
    }

    get currentIndices(): IPoint | null {
        if(this.frames.length <= 0)
            return null;
        
        let timeWeight = 0;
        for(let i = 0; i < this.frames.length; i++) {
            const frame = this.frames[i];
            if(i == this.frames.length - 1)
                return frame.indices;

            timeWeight += frame.timeWeight;
            if(this.timer.value <= timeWeight / this.timeWeightTotal)
                return frame.indices;
        }
    }
}

export class Sprite {
    private readonly animationByName: { [animationName: string]: SpriteAnimation } = {};
    private _currentAnimationName: string;
    public get currentAnimationName(): string { return this._currentAnimationName; }

    public get currentAnimationCompletion(): number { 
        if(this._currentAnimationName in this.animationByName)
            return this.animationByName[this._currentAnimationName].completion;
        return 0;
    }

    constructor(
        private readonly world: World,
        public readonly imageName: string,
        public readonly wFrame: number,
        public readonly hFrame: number,
    ) {}

    get isCurrentAnimationFinished(): boolean {
        if(!(this._currentAnimationName in this.animationByName))
            return false;
        return this.animationByName[this._currentAnimationName].finished;
    }

    addAnimation(animationName: string, animation: SpriteAnimation) {
        this.animationByName[animationName] = animation;
    }

    setAnimation(animationName: string) {
        if(animationName === this._currentAnimationName)
            return;
        
        if(this._currentAnimationName in this.animationByName)
            this.animationByName[this._currentAnimationName].reset();
        this._currentAnimationName = animationName;        
    }

    update() {
        if(this._currentAnimationName in this.animationByName)
            this.animationByName[this._currentAnimationName].update(this.world.delta);
    }

    draw(position: IPoint,
        scale: IPoint=Geometry.Point.One,
        angle: number=0,
        center?:IPoint,
        alpha:number=1
    ) {
        if(this._currentAnimationName in this.animationByName) {
            const animation = this.animationByName[this._currentAnimationName];
            const currentIndices = animation.currentIndices;
            this.drawFrame(position, currentIndices.x, currentIndices.y, scale, angle, center, alpha);
        } else if(this._currentAnimationName == null) {
            this.drawFrame(position, 0, 0);
        }
    }

    private drawFrame(
        position: IPoint,
        xIndex: number,
        yIndex: number,
        scale: IPoint=Geometry.Point.One,
        angle: number=0,
        center?:IPoint,
        alpha:number=1
    ) {
        Draw.imagePart(
            this.world,
            this.imageName,
            position,
            xIndex * this.wFrame,
            yIndex * this.hFrame,
            this.wFrame,
            this.hFrame,
            scale,
            angle,
            center,
            alpha
        );
    }
}