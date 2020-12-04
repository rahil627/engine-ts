import { Entity } from './entity';
import { World } from './world';
import { IRectangle, IPoint } from '@engine-ts/geometry/interfaces';
import { Point } from '@engine-ts/geometry/point';
import { Geometry } from '@engine-ts/geometry/geometry';
import { Rectangle } from '@engine-ts/geometry/rectangle';

export class Actor extends Entity {
    public get bounds(): IRectangle {
        return Geometry.Rectangle.Translate(this.boundsLocal, this.position);
    }
    public readonly boundsLocal: Rectangle;

    public get w(): number {
        return this.boundsLocal.w;
    };
    public set w(w: number) {
        this.boundsLocal.w = w;
    }
    public get h(): number {
        return this.boundsLocal.h;
    }
    public set h(h: number) {
        this.boundsLocal.h = h;
    }
    public get xLeft(): number {
        return this.boundsLocal.x + this.position.x;
    }
    public set xLeft(xLeft: number) {
        this.position.x = xLeft - this.boundsLocal.x;
    }
    public get xRight(): number {
        return this.boundsLocal.x + this.boundsLocal.w + this.position.x;
    }
    public set xRight(xRight: number) {
        this.position.x = xRight - this.boundsLocal.x - this.boundsLocal.w;
    }
    public get yTop(): number {
        return this.boundsLocal.y + this.position.y;
    }
    public set yTop(yTop: number) {
        this.position.y = yTop - this.boundsLocal.y;
    }
    public get yBottom(): number {
        return this.boundsLocal.y + this.boundsLocal.h + this.position.y;
    }
    public set yBottom(yBottom: number) {
        this.position.y = yBottom - this.boundsLocal.y - this.boundsLocal.h;
    }

    public friction: number = 0.01;
    public readonly velocity: Point = new Point();
    public readonly acceleration: Point = new Point();

    constructor(world: World, rectangle: IRectangle, centered: boolean=true) {
        super(world, rectangle);
        this.boundsLocal = new Rectangle( 
            centered ? -rectangle.w/2 : 0,
            centered ? -rectangle.h/2 : 0,
            rectangle.w,
            rectangle.h
        );
    }

    update() {
        this.updateVelocity();
        this.updatePosition();
    }

    protected updateVelocity() {
        this.velocity
            .add(this.frameAcceleration)
            .scale(1 - this.friction);
    }

    protected updatePosition() {
        this.position
            .add(this.frameVelocity);
    }

    get frameVelocity(): IPoint {
        const deltaNormal = this.world.deltaNormal;
        return {
            x: this.velocity.x * deltaNormal,
            y: this.velocity.y * deltaNormal
        }
    }

    get frameAcceleration(): IPoint {
        const deltaNormal = this.world.deltaNormal;
        return {
            x: this.acceleration.x * deltaNormal,
            y: this.acceleration.y * deltaNormal
        }
    }
}