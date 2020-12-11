import { random } from '@engine-ts/core/utils';
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

    constructor(
        private readonly frames: ISpriteFrame[],
        seconds: number,
        loop: boolean = true,
    ) {
        this.timer = loop ? new LoopTimer(seconds) : new Timer(seconds);
        this.timeWeightTotal = this.frames.sumOf(o => o.timeWeight);
    }

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
    private currentAnimationName: string;

    constructor(
        private readonly world: World,
        public readonly imageName: string,
        public readonly wFrame: number,
        public readonly hFrame: number,
    ) {}

    addAnimation(animationName: string, animation: SpriteAnimation) {
        this.animationByName[animationName] = animation;
    }

    setAnimation(animationName: string) {
        if(animationName === this.currentAnimationName)
            return;
        
        if(this.currentAnimationName in this.animationByName)
            this.animationByName[this.currentAnimationName].reset();
        this.currentAnimationName = animationName;        
    }

    update() {
        if(this.currentAnimationName in this.animationByName)
            this.animationByName[this.currentAnimationName].update(this.world.delta);
    }

    draw(position: IPoint,
        scale: IPoint=Geometry.Point.One,
        angle: number=0,
        center?:IPoint,
        alpha:number=1
    ) {
        if(this.currentAnimationName in this.animationByName) {
            const animation = this.animationByName[this.currentAnimationName];
            const currentIndices = animation.currentIndices;
            this.drawFrame(position, currentIndices.x, currentIndices.y, scale, angle, center, alpha);
        } else if(this.currentAnimationName == null) {
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