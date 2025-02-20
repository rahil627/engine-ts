import { Geometry } from './geometry';
import { ISegment, IPoint, ILine, PointPairType, IRay } from './interfaces';
import { Point } from './point';


export class Segment implements ISegment {
    public static Create(segment: ISegment): Segment { return new Segment(Point.Create(segment.a), Point.Create(segment.b)); }

    public get vertices(): Point[] { return [this.a, this.b]; }
    public get hash(): string { return Geometry.Segment.Hash(this); }
    public isEqualTo(segment: ISegment): boolean { return Geometry.Segment.AreEqual(this, segment); }
    public get midpoint(): IPoint { return this.a.midpoint(this.b); }
    public get slope(): number { return Geometry.Segment.Slope(this); }
    public YatX(x: number): number | null { return Geometry.Segment.YatX(this, x); }
    public XatY(y: number): number | null { return Geometry.Segment.XatY(this, y); }
    public lineIntersection(line: ILine): Point | null { return Point.Create(Geometry.Intersection.PointPair(this, PointPairType.SEGMENT, line, PointPairType.LINE)); }
    public rayIntersection(ray: IRay): Point | null { return Point.Create(Geometry.Intersection.PointPair(this, PointPairType.SEGMENT, ray, PointPairType.RAY)); }
    public segmentIntersection(segment: ISegment): Point | null { return Point.Create(Geometry.Intersection.PointPair(this, PointPairType.SEGMENT, segment, PointPairType.SEGMENT)); }
    constructor(public a: Point, public b: Point) {}
    public cloneSegment(): Segment { return Segment.Create(this); }    
}