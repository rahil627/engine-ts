import { Point } from './point';
import { ICircle, IPoint, IRectangle } from './interfaces';
import { Geometry } from './geometry';


export class Circle extends Point implements ICircle { 
    constructor(public x: number=0, public y: number=0, public radius: number=0) {
        super(x, y);
    }
    public cloneCircle(): Circle { return new Circle(this.x, this.y, this.radius); }

    public get circumference(): number { return Geometry.Circle.Circumference(this); }
    public get area(): number { return Geometry.Circle.Area(this); }
    public get bounds(): IRectangle { return Geometry.Circle.Bounds(this); }
    public get diameter(): number { return this.radius * 2; }
    public collidesPoint(point: IPoint): boolean { return Geometry.Collide.CirclePoint(this, point); }
    public collidesRectangle(rectangle: IRectangle): boolean { return Geometry.Collide.RectangleCircle(rectangle, this); }
}

