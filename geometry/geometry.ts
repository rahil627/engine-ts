import { tau, random, clamp, angleDifference, moduloSafe, binomialCoefficient, Halign, Valign } from '@engine-ts/core/utils';
import { ISegment, IPoint, ICircle, ITriangle, IRectangle, IPointPair, IPolygon, ILine, PointPairType, IRay, IRaycastResult } from './interfaces';

interface IPointListStatic<T> {
    Segments: (o: T) => ISegment[],
    Vertices: (o: T) => IPoint[],
    Circumcircle: (o: T) => ICircle,
    Supertriangle: (o: T) => ITriangle,
    Triangulation: (o: T) => ITriangle[],
    Bounds: (o: T) => IRectangle,
    Hash: (o: T) => string
    // TODO: make Translate a function on IPointListStatic
    // TODO: make Rotate a function on IPointListStatic
}

interface IPointsStatic extends IPointListStatic<IPoint[]> {
    Sum: (points: IPoint[]) => IPoint,
    BezierPoint: (points: IPoint[], t: number) => IPoint,
    Bezier: (points: IPoint[], count: number) => IPoint[]
}

interface IShapeStatic<T> extends IPointListStatic<T> {
    Midpoint: (o: T) => IPoint,
    Area: (o: T) => number
}

interface ITriangleStatic extends IShapeStatic<ITriangle> {
    AreaSigned: (triangle: ITriangle) => number,
    
    // TODO: add these to IShapeStatic<T>
    Perimeter: (triangle: ITriangle) => number,
    Semiperimeter: (triangle: ITriangle) => number,

    Incenter: (triangle: ITriangle) => IPoint,
    Inradius: (triangle: ITriangle) => number,
    InscribedCircle: (triangle: ITriangle) => ICircle,
    AngleA: (triangle: ITriangle) => number,
    AngleB: (triangle: ITriangle) => number,
    AngleC: (triangle: ITriangle) => number,
    LengthAB: (triangle: ITriangle) => number,
    LengthBC: (triangle: ITriangle) => number,
    LengthCA: (triangle: ITriangle) => number,
    AngleBisector: (bisectionVertex: IPoint, previousVertex: IPoint, nextVertex: IPoint)=> IRay,
    AngleBisectorA: (triangle: ITriangle) => IRay,
    AngleBisectorB: (triangle: ITriangle) => IRay,
    AngleBisectorC: (triangle: ITriangle) => IRay,
    PerpendicularBisectorAB: (triangle: ITriangle) => ILine,
    PerpendicularBisectorBC: (triangle: ITriangle) => ILine,
    PerpendicularBisectorCA: (triangle: ITriangle) => ILine,
    Translate: (triangle: ITriangle, position: IPoint) => ITriangle,
    Rotate: (triangle: ITriangle, angle: number, center?: IPoint) => ITriangle
}

interface IRectangleStatic extends IShapeStatic<IRectangle> {
    BoundsRectangles: (rectangles: IRectangle[]) => IRectangle,
    Scale: (rectangle: IRectangle, scalar: number | IPoint, center?: IPoint) => IRectangle,
    // Expands this rectangle by the given amount on each side (if hAmount isn't specified, wAmount will be used)
    Expand: (rectangle: IRectangle, wAmount: number, hAmount?: number) => IRectangle,
    RandomPointInside: (rectangle: IRectangle) => IPoint,
    Square: (center: IPoint, sideLength: number) => IRectangle,
    Translate: (rectangle: IRectangle, translation: IPoint) => IRectangle,
    Align: (rectangle: IRectangle, halign: Halign, valign: Valign) => IRectangle,
    Center: (rectangle: IRectangle) => IPoint,
    TopLeft: (rectangle: IRectangle) => IPoint,
    TopRight: (rectangle: IRectangle) => IPoint,
    BottomLeft: (rectangle: IRectangle) => IPoint,
    BottomRight: (rectangle: IRectangle) => IPoint,
    xLeft: (rectangle: IRectangle) => number,
    xRight: (rectangle: IRectangle) => number,
    yTop: (rectangle: IRectangle) => number,
    yBottom: (rectangle: IRectangle) => number,
}

interface IPolygonStatic extends IShapeStatic<IPolygon> {
    WindingNumber: (polygon: IPolygon, point: IPoint) => number,
    Rotate: (polygon: IPolygon, angle: number, center?: IPoint) => IPolygon
    Translate: (polygon: IPolygon, position: IPoint) => IPolygon,
    // TODO: function for creating regular polygons (copy "_getRegularPolygonPoints" in Draw.ts)
}

interface ICircleStatic {
    Circumcircle: (circle: ICircle) => ICircle,
    Supertriangle: (o: ICircle) => ITriangle,
    Midpoint: (o: ICircle) => IPoint,
    Area: (o: ICircle) => number,
    Circumference: (o: ICircle) => number,
    Bounds: (o: ICircle) => IRectangle,
    Hash: (o: ICircle) => string,
    RandomPointInside: (circle: ICircle) => IPoint,
    Translate: (circle: ICircle, translation: IPoint) => ICircle,
    Rotate: (circle: ICircle, angle: number, center?: IPoint) => ICircle,
    // returns the points on 'circle' that are tangent when they form a segment with 'point'
    TangentPoints: (circle: ICircle, point: IPoint) => { a: IPoint, b: IPoint } | null
}

interface IPointStatic {
    readonly Zero: IPoint,
    readonly One: IPoint,
    readonly Up: IPoint,
    readonly Down: IPoint,
    readonly Left: IPoint,
    readonly Right: IPoint,
    AreEqual: (a: IPoint, b: IPoint) => boolean,
    Hash: (point: IPoint) => string,
    DistanceSq: (a: IPoint, b: IPoint) => number,
    Distance: (a: IPoint, b: IPoint) => number,
    Add: (a: IPoint, b: IPoint) => IPoint,
    Subtract: (a: IPoint, b: IPoint) => IPoint,
    Midpoint: (...points: IPoint[]) => IPoint | null,
    Angle: (point: IPoint) => number,
    Scale: (point: IPoint, scalar: number | IPoint, from?: IPoint) => IPoint,
    LengthSq: (point: IPoint) => number,
    Length: (point: IPoint) => number,
    Dot: (a: IPoint, b: IPoint) => number,
    Cross: (a: IPoint, b: IPoint) => number,
    Project: (a: IPoint, b: IPoint) => IPoint,
    Normalized: (point: IPoint, length?: number) => IPoint,
    Rotate: (point: IPoint, angle: number, center?: IPoint) => IPoint,
    Negative: (point: IPoint) => IPoint,
    Wiggle: (point: IPoint, angleRangeMax: number, center?: IPoint) => IPoint,
    Towardness: (a: IPoint, b: IPoint) => number,
    Lerp: (from: IPoint, to: IPoint, t: number) => IPoint,
    Flip: (point: IPoint, center?: IPoint) => IPoint,
    Reflect: (point: IPoint, pair: IPointPair) => IPoint,
    ClampedInRectangle: (point: IPoint, rectangle: IRectangle) => IPoint,
    Vector: (length: number, angle: number) => IPoint,
    UnitVector: (angle: number) => IPoint,
    IsLeftCenterRightOf: (point: IPoint, { a, b }: IPointPair) => number,
    IsLeftOf: (point: IPoint, pair: IPointPair) => boolean,
    IsColinearWith: (point: IPoint, pair: IPointPair) => boolean,
    IsRightOf: (point: IPoint, pair: IPointPair) => boolean,
    // Returns a list of the velocity vectors a projectile would need in order to hit the (xTarget, yTarget) from (xStart, yStart)
    // given the speed of the shot and gravity. Returns 0, 1, or 2 Points (if two points, the highest-arching vector is first)
    LaunchVectors: (start: IPoint, target: IPoint, gravityMagnitude: number, velocityMagnitude: number) => IPoint[]
}

interface IPointPairStatic<T extends IPointPair> {
    AreEqual: (pairA: T, pairB: T) => boolean,
    YatX: (pair: T, x: number) => number,
    XatY: (pair: T, y: number) => number,
    Slope: (pair: T) => number,
    Hash: (pair: T) => string,
    ClosestPointTo: (pair: T, point: IPoint) => IPoint
}

interface ILineStatic extends IPointPairStatic<ILine> {
    Yintercept: (line: ILine) => number
};

interface IRayStatic extends IPointPairStatic<IRay> {
    DefaultMaxDistance: number,
    AsSegment: (ray: IRay, length: number) => ISegment,
    PointAtDistance: (ray: IRay, length: number) => IPoint,
    Cast: <T extends ISegment>(ray: IRay, segments: T[], maxDistance: number) => IRaycastResult<T> | null
};

interface ISegmentStatic extends IPointPairStatic<ISegment> {
    Midpoint: (segment: ISegment) => IPoint,
    PerpendicularBisector: (segment: ISegment) => ILine,
    SharedVertex: (segmentA: ISegment, segmentB: ISegment) => IPoint | null
}

export class Geometry {

    private static readonly HashDecimalDigits: number = 6;
    private static readonly Tolerance: number = 0.00000001;

    public static IsWithinToleranceOf(a: number, b: number=0): boolean {
        return Math.abs(a - b) < this.Tolerance;
    }

    public static Point: IPointStatic = {
        Zero: { x: 0, y: 0 },
        One: { x: 1, y: 1 },
        Up: { x: 0, y: -1 },
        Down: { x: 0, y: 1 },
        Left: { x: -1, y: 0 },
        Right: { x: 1, y: 0 },
        AreEqual: (a: IPoint, b: IPoint) => Geometry.IsWithinToleranceOf(Geometry.Point.DistanceSq(a, b)),
        Hash: (point: IPoint) => `${point.x.toFixed(Geometry.HashDecimalDigits)},${point.y.toFixed(Geometry.HashDecimalDigits)}`,
        DistanceSq: (a: IPoint, b: IPoint): number => (a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y),
        Distance: (a: IPoint, b: IPoint): number => Math.sqrt(Geometry.Point.DistanceSq(a, b)),
        Add: (a: IPoint, b: IPoint): IPoint => ({ x: a.x + b.x, y: a.y + b.y }),
        Subtract: (a: IPoint, b: IPoint): IPoint => ({ x: a.x - b.x, y: a.y - b.y }),
        Midpoint: (...points: IPoint[]): IPoint | null => {
            if(points.length <= 0)
                return null;
            const sum = { x: 0, y: 0 };
            points.forEach(point => { sum.x += point.x; sum.y += point.y; });
            return {
                x: sum.x / points.length,
                y: sum.y / points.length
            };
        },
        Angle: (point: IPoint): number => Math.atan2(point.y, point.x),
        Scale: (point: IPoint, scalar: number | IPoint, from?: IPoint): IPoint => {
            return from != null
                ? (typeof scalar === "number"
                    ? { x: (point.x - from.x) * scalar + from.x, y: (point.y - from.y) * scalar + from.y }
                    : { x: (point.x - from.x) * scalar.x + from.x, y: (point.y - from.y) * scalar.y + from.y })
                : (typeof scalar === "number"
                    ? { x: point.x * scalar, y: point.y * scalar }
                    : { x: point.x * scalar.x, y: point.y * scalar.y })
        },
        LengthSq: (point: IPoint): number => point.x * point.x + point.y * point.y,
        Length: (point: IPoint): number => Math.sqrt(Geometry.Point.LengthSq(point)),
        Dot: (a: IPoint, b: IPoint): number => a.x * b.x + a.y * b.y,
        Cross: (a: IPoint, b: IPoint): number => a.x * b.y - b.x * a.y,
        Project: (a: IPoint, b: IPoint): IPoint => { 
            return Geometry.Point.Scale(b, Geometry.Point.Dot(a, b) / Math.max(Geometry.Point.LengthSq(b), Geometry.Tolerance)); 
        },
        Normalized: (point: IPoint, length?: number): IPoint => {
            if((point.x === 0 && point.y === 0) || length === 0)
                return { x: 0, y: 0 };
            const temp = (length == undefined ? 1 : length) / Geometry.Point.Length(point);
            return { x: point.x * temp, y: point.y * temp };
        },
        Rotate: (point: IPoint, angle: number, center?: IPoint): IPoint => {
            const x = point.x - (center ? center.x : 0);
            const y = point.y - (center ? center.y : 0);
            return {
                x: (center ? center.x : 0) + x * Math.cos(angle) - y * Math.sin(angle),
                y: (center ? center.y : 0) + y * Math.cos(angle) + x * Math.sin(angle)
            };
        },
        // same as rotating a vector 180 degrees
        Negative: (point: IPoint): IPoint => ({ x: -point.x, y: -point.y }),
        // rotates the point randomly in the range given about the center, or the origin if it is not defined
        Wiggle: (point: IPoint, angleRangeMax: number, center?: IPoint): IPoint => Geometry.Point.Rotate(point, angleRangeMax * (random() - 0.5), center),
        // Returns how much a (as a vector) faces in the direction of b (as a vector)
        // -1 = a faces opposite the direction of b
        // 0 = a faces perpendicular to the direction of b
        // 1 = a faces the exact same direction as b
        Towardness: (a: IPoint, b: IPoint): number => Geometry.Point.Dot(Geometry.Point.Normalized(a), Geometry.Point.Normalized(b)),
        // t = 0 =  from
        // t = 0.5 = midpoint between from and to
        // t = 1 = to
        Lerp: (from: IPoint, to: IPoint, t: number): IPoint => Geometry.Point.Add(Geometry.Point.Scale(Geometry.Point.Subtract(to, from), t), from),
        // returns a version of this point which is flipped over (rotated 180 degrees around) the given point
        // (or the origin if none is provided). Provided because it is faster than using rotate/reflect.
        Flip: (point: IPoint, center?: IPoint): IPoint => { 
            return center
                ? { x: 2 * center.x - point.x, y: 2 * center.y - point.y } 
                : Geometry.Point.Negative(point);
        },
        // reflects the given point over the given line
        Reflect: (point: IPoint, pair: IPointPair): IPoint => {
            // use the Line method for Rays & Segments too
            const reflectionPoint = Geometry.Line.ClosestPointTo(pair, point);
            return Geometry.Point.Add(Geometry.Point.Scale(Geometry.Point.Subtract(reflectionPoint, point), 2), point);
        },
        ClampedInRectangle: (point: IPoint, rectangle: IRectangle): IPoint => ({
            x: clamp(point.x, rectangle.x, rectangle.x + rectangle.w),
            y: clamp(point.y, rectangle.y, rectangle.y + rectangle.h)
        }),
        Vector: (length: number, angle: number): IPoint => ({ x: Math.cos(angle) * length, y: Math.sin(angle) * length }),
        UnitVector: (angle: number): IPoint => Geometry.Point.Vector(1, angle),
        // if result is > 0, then this point is left of the line/segment/ray formed by the two points.
        // if result is < 0, then this point is right of the line/segment/ray formed by the two points. 
        // if result == 0, then it is colinear with the two points.
        IsLeftCenterRightOf: (point: IPoint, { a, b }: IPointPair): number => Math.sign((b.x - a.x) * (point.y - a.y) - (b.y - a.y) * (point.x - a.x)),
        IsLeftOf: (point: IPoint, pair: IPointPair): boolean => Geometry.Point.IsLeftCenterRightOf(point, pair) > 0,
        IsColinearWith: (point: IPoint, pair: IPointPair): boolean => Geometry.IsWithinToleranceOf(Geometry.Point.IsLeftCenterRightOf(point, pair)),
        IsRightOf: (point: IPoint, pair: IPointPair): boolean => Geometry.Point.IsLeftCenterRightOf(point, pair) < 0,
        // Returns a list of the velocity vectors a projectile would need in order to hit 'target' from 'start'
        // given the speed of the shot and gravity. Returns 0, 1, or 2 Points (if two points, the highest-arching vector is first)
        LaunchVectors: (start: IPoint, target: IPoint, gravityMagnitude: number, velocityMagnitude: number) => {
            if(velocityMagnitude === 0)
                return [];
    
            const diff = Geometry.Point.Subtract(target, start);
            if(gravityMagnitude === 0)
                return [Geometry.Point.Normalized(diff, velocityMagnitude)];
    
            const g = -gravityMagnitude;
            const v = velocityMagnitude;
            const v2 = v * v;
            const sqrt = v2 * v2 - g * (g * diff.x * diff.x + 2 * diff.y * v2);
    
            if(diff.x === 0 && sqrt === 0)
                return [Geometry.Point.Vector(Math.sign(diff.x) * v, -tau/4)];
    
            if(diff.x === 0)
                return diff.y > 0
                    ? [{ x: 0, y: v}]
                    : diff.y < 0
                        ? [{ x: 0, y: -v }]
                        : [{ x: 0, y: v }, { x: 0, y: -v }];
    
            if (sqrt < 0)
                return [];
    
            return [
                Geometry.Point.Vector(Math.sign(diff.x) * v, Math.atan((v2 + Math.sqrt(sqrt))/(g * diff.x))),
                Geometry.Point.Vector(Math.sign(diff.x) * v, Math.atan((v2 - Math.sqrt(sqrt))/(g * diff.x)))
            ];
        }
    };

    public static PointPair = {
        YatX: (pair: IPointPair, x: number): number => {
            const slope = Geometry.Line.Slope(pair);
            return slope === Number.POSITIVE_INFINITY
                ? Number.POSITIVE_INFINITY
                : slope === Number.NEGATIVE_INFINITY
                    ? Number.NEGATIVE_INFINITY
                    : pair.a.y + (x - pair.a.x) * slope;
        },
        XatY: (pair: IPointPair, y: number): number => {
            const slope = Geometry.Line.Slope(pair);
            return slope === Number.POSITIVE_INFINITY || slope === Number.NEGATIVE_INFINITY
                ? pair.a.x
                : pair.a.x + (y - pair.a.y) / slope;
        },
        Slope: (pair: IPointPair): number => pair.b.x !== pair.a.x 
            ? (pair.b.y - pair.a.y) / (pair.b.x - pair.a.x) 
            : (pair.b.y > pair.a.y 
                ? Number.NEGATIVE_INFINITY 
                : Number.POSITIVE_INFINITY)
    }

    public static Line: ILineStatic = {
        AreEqual: (lineA: ILine, lineB: ILine): boolean => Geometry.Line.Hash(lineA) === Geometry.Line.Hash(lineB),
        YatX: (line: ILine, x: number): number => Geometry.PointPair.YatX(line, x),
        XatY: (line: ILine, y: number): number => Geometry.PointPair.XatY(line, y),
        Slope: (line: ILine): number => Geometry.PointPair.Slope(line),
        Hash: (line: ILine): string => `${Geometry.Line.Slope(line).toFixed(6)}${Geometry.Line.YatX(line, 0).toFixed(6)}`,
        ClosestPointTo: (line: ILine, point: IPoint): IPoint =>
            Geometry.Point.Add(line.a,
                Geometry.Point.Project(
                    Geometry.Point.Subtract(point, line.a), 
                    Geometry.Point.Subtract(line.b, line.a)
                )
            ),
        Yintercept: (line: ILine): number => Geometry.Line.YatX(line, 0)
    };

    public static Ray: IRayStatic = {
        AreEqual: (rayA: IRay, rayB: IRay): boolean => Geometry.Ray.Hash(rayA) === Geometry.Ray.Hash(rayB),
        YatX: (ray: IRay, x: number): number | null => Math.sign(x - ray.a.x) * Math.sign(ray.b.x - ray.a.x) === -1 ? null : Geometry.PointPair.YatX(ray, x),
        XatY: (ray: IRay, y: number): number | null => Math.sign(y - ray.a.y) * Math.sign(ray.b.y - ray.a.y) === -1 ? null : Geometry.PointPair.XatY(ray, y),
        Slope: (ray: IRay): number => Geometry.PointPair.Slope(ray),
        Hash: (ray: IRay): string => Geometry.Points.Hash([ray.a, Geometry.Point.Add(Geometry.Point.Normalized(Geometry.Point.Subtract(ray.b, ray.a)), ray.a)]),
        DefaultMaxDistance: 1000000,
        AsSegment: (ray: IRay, length: number=Geometry.Ray.DefaultMaxDistance): ISegment => ({
            a: ray.a, 
            b: Geometry.Point.Add(Geometry.Point.Normalized(Geometry.Point.Subtract(ray.b, ray.a), length), ray.a)
        }),
        PointAtDistance: (ray: IRay, length: number=Geometry.Ray.DefaultMaxDistance): IPoint => {
            return Geometry.Point.Add(Geometry.Point.Normalized(Geometry.Point.Subtract(ray.b, ray.a), length), ray.a);
        },
        Cast: <T extends ISegment>(ray: IRay, segments: T[], maxDistance: number=Geometry.Ray.DefaultMaxDistance): IRaycastResult<T> | null => {
            const raySegment = Geometry.Ray.AsSegment(ray, maxDistance);
            const segmentIntersection = segments
                .map(segment => ({ segment, intersection: Geometry.Intersection.SegmentSegment(raySegment, segment) }))
                .filter(({ segment, intersection }) => intersection != null && segment != null)
                .minOf(({ intersection }) => Geometry.Point.DistanceSq(intersection, ray.a));
            return segmentIntersection == null 
                ? null 
                : {
                    contactPoint: segmentIntersection.intersection,
                    segmentHit: segmentIntersection.segment
                };
        },
        ClosestPointTo: ({ a, b }: IRay, point: IPoint): IPoint => {
            const ab = Geometry.Point.Subtract(b, a);
            const ret = Geometry.Point.Add(Geometry.Point.Project(Geometry.Point.Subtract(point, a), ab), a);
            const r = Geometry.Point.Dot(Geometry.Point.Subtract(ret, a), ab);
            return r < 0 ? a : ret;
        }
    };

    public static Segment: ISegmentStatic = {
        AreEqual: (segmentA: ISegment, segmentB: ISegment): boolean => Geometry.Segment.Hash(segmentA) === Geometry.Segment.Hash(segmentB),
        YatX: (segment: ISegment, x: number): number | null => 
            Math.sign(x - segment.a.x) * Math.sign(segment.b.x - segment.a.x) === -1 &&
            Math.sign(x - segment.b.x) * Math.sign(segment.a.x - segment.b.x) === -1
                ? Geometry.PointPair.YatX(segment, x)
                : null,
        XatY: (segment: ISegment, y: number): number | null =>
            Math.sign(y - segment.a.y) * Math.sign(segment.b.y - segment.a.y) === -1 &&
            Math.sign(y - segment.b.y) * Math.sign(segment.a.y - segment.b.y) === -1
                ? Geometry.PointPair.XatY(segment, y) 
                : null,
        Slope: (segment: ISegment): number => Geometry.PointPair.Slope(segment),
        Hash: (segment: ISegment): string => Geometry.Points.Hash([segment.a, segment.b]),
        ClosestPointTo: ({ a, b }: ISegment, point: IPoint): IPoint => {
            const ab = Geometry.Point.Subtract(b, a);
            const ret = Geometry.Point.Add(Geometry.Point.Project(Geometry.Point.Subtract(point, a), ab), a);
            const r = Geometry.Point.Dot(Geometry.Point.Subtract(ret, a), ab);
            if(r < 0) return a;
            if(r > Geometry.Point.LengthSq(ab)) return b;
            return ret;
        },
        Midpoint: (segment: ISegment): IPoint => ({ 
            x: (segment.a.x + segment.b.x) / 2,
            y: (segment.a.y + segment.b.y) / 2
        }),
        PerpendicularBisector: (segment: ISegment): ILine => {
            const midpoint = Geometry.Segment.Midpoint(segment);
            return {
                a: midpoint,
                b: Geometry.Point.Add(
                    midpoint, 
                    Geometry.Point.Rotate(
                        Geometry.Point.Subtract(segment.b, segment.a),
                        tau/4))
            };
        },
        SharedVertex: (segmentA: ISegment, segmentB: ISegment): IPoint | null =>
            Geometry.Point.AreEqual(segmentA.a, segmentB.a) || Geometry.Point.AreEqual(segmentA.a, segmentB.b)
                ? segmentA.a
                : Geometry.Point.AreEqual(segmentA.b, segmentB.a) || Geometry.Point.AreEqual(segmentA.b, segmentB.b)
                    ? segmentA.b
                    : null
    };

    public static Triangle: ITriangleStatic = {
        Segments: (triangle: ITriangle): ISegment[] => Geometry.Points.Segments(Geometry.Triangle.Vertices(triangle)),
        Vertices: (triangle: ITriangle): IPoint[] => [triangle.a, triangle.b, triangle.c],
        Circumcircle: (triangle: ITriangle): ICircle => {
            const intersection = Geometry.Intersection.LineLine(
                Geometry.Segment.PerpendicularBisector({ a: triangle.a, b: triangle.b }),
                Geometry.Segment.PerpendicularBisector({ a: triangle.b, b: triangle.c})
            );
            if(!intersection)
                throw "No intersection found!";
            
            return {
                x: intersection.x, 
                y: intersection.y, 
                radius: Geometry.Point.Distance(triangle.a, intersection)
            };
        },
        Supertriangle: (triangle: ITriangle): ITriangle => triangle,
        Triangulation: (triangle: ITriangle): ITriangle[] => [triangle],
        Bounds: (triangle: ITriangle): IRectangle => Geometry.Points.Bounds(Geometry.Triangle.Vertices(triangle)),
        Midpoint: (triangle: ITriangle): IPoint => Geometry.Point.Midpoint(...Geometry.Triangle.Vertices(triangle)),
        Area: (triangle: ITriangle): number => Math.abs(Geometry.Triangle.AreaSigned(triangle)),
        AreaSigned: (triangle: ITriangle): number => 0.5 * (
            -triangle.b.y * triangle.c.x 
            + triangle.a.y * (-triangle.b.x + triangle.c.x) 
            + triangle.a.x * (triangle.b.y - triangle.c.y) 
            + triangle.b.x * triangle.c.y
        ),
        Perimeter: (triangle: ITriangle): number => Geometry.Triangle.LengthAB(triangle) + Geometry.Triangle.LengthBC(triangle) + Geometry.Triangle.LengthCA(triangle),
        Semiperimeter: (triangle: ITriangle): number => Geometry.Triangle.Perimeter(triangle) / 2,
        Hash: (triangle: ITriangle): string => Geometry.Points.Hash(Geometry.Triangle.Vertices(triangle)),
        Incenter: (triangle: ITriangle): IPoint => {
            const bisectorA = Geometry.Triangle.AngleBisectorA(triangle);
            const bisectorB = Geometry.Triangle.AngleBisectorB(triangle);
            const intersection = Geometry.Intersection.RayRay(bisectorA, bisectorB);
            if(!intersection)
                throw `No intersection found between angle bisectors of points "a" and "b" in triangle (${triangle.a}, ${triangle.b}, ${triangle.c}`;
            return intersection;
		},
        Inradius: (triangle: ITriangle): number => {
            const lengthAB = Geometry.Triangle.LengthAB(triangle);
            const lengthBC = Geometry.Triangle.LengthBC(triangle);
            const lengthCA = Geometry.Triangle.LengthCA(triangle);
            const s = (lengthAB + lengthBC + lengthCA) / 2;
            return Math.sqrt(s * (s - lengthAB) * (s - lengthBC) * (s - lengthCA)) / s;
		},
        InscribedCircle: (triangle: ITriangle): ICircle => {
            const { x, y } = Geometry.Triangle.Incenter(triangle);
            const radius = Geometry.Triangle.Inradius(triangle);
            return { x, y, radius };
		},
        AngleA: (triangle: ITriangle): number => {
            const angleAB = Geometry.Point.Angle(Geometry.Point.Subtract(triangle.b, triangle.a));
            const angleAC = Geometry.Point.Angle(Geometry.Point.Subtract(triangle.c, triangle.a));
            return Math.abs(angleAC - angleAB);
		},
        AngleB: (triangle: ITriangle): number => {
            const angleBC = Geometry.Point.Angle(Geometry.Point.Subtract(triangle.c, triangle.b));
            const angleBA = Geometry.Point.Angle(Geometry.Point.Subtract(triangle.a, triangle.b));
            return Math.abs(angleBA - angleBC);
		},
        AngleC: (triangle: ITriangle): number => {
            const angleCA = Geometry.Point.Angle(Geometry.Point.Subtract(triangle.a, triangle.c));
            const angleCB = Geometry.Point.Angle(Geometry.Point.Subtract(triangle.b, triangle.c));
            return Math.abs(angleCB - angleCA);
		},
        LengthAB: (triangle: ITriangle): number => Geometry.Point.Distance(triangle.a, triangle.b),
        LengthBC: (triangle: ITriangle): number => Geometry.Point.Distance(triangle.b, triangle.c),
        LengthCA: (triangle: ITriangle): number => Geometry.Point.Distance(triangle.c, triangle.a),
        // returns the angle bisector of a given vertex ( vertices ordered: a => b => c )
        AngleBisector: (bisectionVertex: IPoint, previousVertex: IPoint, nextVertex: IPoint): IRay => {
            const angleAB = Geometry.Point.Angle(Geometry.Point.Subtract(nextVertex, bisectionVertex));
            const angleAC = Geometry.Point.Angle(Geometry.Point.Subtract(previousVertex, bisectionVertex));
            const angleBisector = moduloSafe(angleDifference(angleAB, angleAC) / 2 + angleAB, tau);
            return { 
                a: bisectionVertex,
                b: Geometry.Point.Add(bisectionVertex, Geometry.Point.Vector(1, angleBisector))
            }
        },
        AngleBisectorA: ({ a, b, c }: ITriangle): IRay => Geometry.Triangle.AngleBisector(a, c, b),
        AngleBisectorB: ({ a, b, c }: ITriangle): IRay => Geometry.Triangle.AngleBisector(b, a, c),
        AngleBisectorC: ({ a, b, c }: ITriangle): IRay => Geometry.Triangle.AngleBisector(c, b, a),
        PerpendicularBisectorAB: (triangle: ITriangle): ILine => Geometry.Segment.PerpendicularBisector({ a: triangle.a, b: triangle.b }),
        PerpendicularBisectorBC: (triangle: ITriangle): ILine => Geometry.Segment.PerpendicularBisector({ a: triangle.b, b: triangle.c }),
        PerpendicularBisectorCA: (triangle: ITriangle): ILine => Geometry.Segment.PerpendicularBisector({ a: triangle.c, b: triangle.a }),
        Translate: (triangle: ITriangle, position: IPoint): ITriangle => ({
            a: Geometry.Point.Add(triangle.a, position),
            b: Geometry.Point.Add(triangle.b, position),
            c: Geometry.Point.Add(triangle.c, position),
        }),
        Rotate: ({ a, b, c }: ITriangle, angle: number, center?: IPoint) => ({
            a: Geometry.Point.Rotate(a, angle, center),
            b: Geometry.Point.Rotate(b, angle, center),
            c: Geometry.Point.Rotate(c, angle, center)
        })
    };

    public static Rectangle: IRectangleStatic = {
        Segments: (rectangle: IRectangle): ISegment[] => Geometry.Points.Segments(Geometry.Rectangle.Vertices(rectangle)),
        Vertices: (rectangle: IRectangle): IPoint[] => [
            rectangle,
            { x: rectangle.x + rectangle.w, y: rectangle.y },
            { x: rectangle.x + rectangle.w, y: rectangle.y + rectangle.h },
            { x: rectangle.x, y: rectangle.y + rectangle.h}
        ],
        Circumcircle: (rectangle: IRectangle): ICircle => ({
            x: rectangle.x + rectangle.w/2,
            y: rectangle.y + rectangle.h/2,
            radius: Geometry.Point.Length({ x: rectangle.w/2, y: rectangle.h/2 })
        }),
        Supertriangle: (rectangle: IRectangle): ITriangle => Geometry.Points.Supertriangle(Geometry.Rectangle.Vertices(rectangle)),
        Triangulation: (rectangle: IRectangle): ITriangle[] => {
            const corners = Geometry.Rectangle.Vertices(rectangle);
            return [
                { a: corners[1], b: corners[0], c: corners[2] },
                { a: corners[0], b: corners[3], c: corners[2] }
            ];
        },
        Bounds: (rectangle: IRectangle): IRectangle => rectangle,
        BoundsRectangles: (rectangles: IRectangle[]) => {
            if(rectangles == null || rectangles.length <= 0)
                return { x: 0, y: 0, w: 0, h: 0 };
            const xMin = rectangles.map(o => o.x).min();
            const yMin = rectangles.map(o => o.y).min();
            const xMax = rectangles.map(o => o.x + o.w).max();
            const yMax = rectangles.map(o => o.y + o.h).max();
            return { x: xMin, y: yMin, w: xMax - xMin, h: yMax - yMin };
        },
        Midpoint: (rectangle: IRectangle): IPoint => ({ x: rectangle.x + rectangle.w/2, y: rectangle.y + rectangle.h/2 }),
        Area: (rectangle: IRectangle): number => rectangle.w * rectangle.h,
        Hash: (rectangle: IRectangle): string => Geometry.Points.Hash(Geometry.Rectangle.Vertices(rectangle)),
        // Expands the size of this rectangle by the given amount relative to its current size.
        // "center" defines the position the rectangle is expanding from (if undefined, the top-left of the rectangle is used)
        Scale: (rectangle: IRectangle, scalar: number | IPoint, center?: IPoint): IRectangle => {
            if(scalar === 1)
                return rectangle;

            const position = center
                ? Geometry.Point.Add(
                        Geometry.Point.Scale(
                            Geometry.Point.Subtract(rectangle, center),
                            scalar
                        ),
                        center
                    )
                : rectangle;
            
            return typeof scalar === "number"
                ? {
                    x: position.x,
                    y: position.y,
                    w: rectangle.w * scalar,
                    h: rectangle.h * scalar
                }
                : {
                    x: position.x,
                    y: position.y,
                    w: rectangle.w * scalar.x,
                    h: rectangle.h * scalar.y
                }
        },
        Expand: (rectangle: IRectangle, wAmount: number, hAmount: number=wAmount): IRectangle => ({
            x: rectangle.x - wAmount,
            y: rectangle.y - hAmount,
            w: rectangle.w + 2 * wAmount,
            h: rectangle.h + 2 * hAmount
        }),
        RandomPointInside: (rectangle: IRectangle): IPoint => ({
            x: rectangle.x + random() * rectangle.w,
            y: rectangle.y + random() * rectangle.h
        }),
        Square: (center: IPoint, sideLength: number): IRectangle => ({
            x: center.x - sideLength/2,
            y: center.y - sideLength/2,
            w: sideLength,
            h: sideLength
        }),
        Translate: (rectangle: IRectangle, translation: IPoint): IRectangle => ({
            x: rectangle.x + translation.x,
            y: rectangle.y + translation.y,
            w: rectangle.w,
            h: rectangle.h
        }),
        Align: (rectangle: IRectangle, halign: Halign, valign: Valign): IRectangle => {
            const offset = { x: 0, y: 0 };
            switch(halign) {
                case Halign.CENTER:
                    offset.x -= rectangle.w/2;
                    break;
                case Halign.RIGHT:
                    offset.x -= rectangle.w;
                    break;
                case Halign.LEFT:
                default:
                    break;
            }
            switch(valign) {
                case Valign.MIDDLE:
                    offset.y -= rectangle.h/2;
                    break;
                case Valign.BOTTOM:
                    offset.y -= rectangle.h;
                    break;
                case Valign.TOP:
                default:
                    break;
            }
            return Geometry.Rectangle.Translate(rectangle, offset);
        },
        Center: (rectangle: IRectangle): IPoint => ({
            x: rectangle.x + rectangle.w/2,
            y: rectangle.y + rectangle.h/2
        }),
        TopLeft: (rectangle: IRectangle): IPoint => rectangle,
        TopRight: (rectangle: IRectangle): IPoint => ({
            x: rectangle.x + rectangle.w,
            y: rectangle.y
        }),
        BottomLeft: (rectangle: IRectangle): IPoint => ({
            x: rectangle.x,
            y: rectangle.y + rectangle.h
        }),
        BottomRight: (rectangle: IRectangle): IPoint => ({
            x: rectangle.x + rectangle.w,
            y: rectangle.y + rectangle.h
        }),
        xLeft: (rectangle: IRectangle): number => rectangle.x,
        xRight: (rectangle: IRectangle): number => rectangle.x + rectangle.w,
        yTop: (rectangle: IRectangle) => rectangle.y,
        yBottom: (rectangle: IRectangle) => rectangle.y + rectangle.h,
    }

    public static Polygon: IPolygonStatic = {
        Segments: (polygon: IPolygon): ISegment[] => Geometry.Points.Segments(polygon.vertices),
        Vertices: (polygon: IPolygon): IPoint[] => polygon.vertices.clone(),
        Circumcircle: (polygon: IPolygon): ICircle => Geometry.Points.Circumcircle(polygon.vertices),
        Supertriangle: (polygon: IPolygon): ITriangle => Geometry.Points.Supertriangle(polygon.vertices),
        Triangulation: (polygon: IPolygon): ITriangle[] => Geometry.Points.Triangulation(polygon.vertices),
        Bounds: (polygon: IPolygon): IRectangle => Geometry.Points.Bounds(polygon.vertices),
        Midpoint: (polygon: IPolygon): IPoint => Geometry.Point.Midpoint(...polygon.vertices),
        Area: (polygon: IPolygon): number => Geometry.Polygon.Triangulation(polygon).map(o => Geometry.Triangle.Area(o)).sum(),
        Rotate: (polygon: IPolygon, angle: number, center?: IPoint): IPolygon => ({ vertices: polygon.vertices.map(o => Geometry.Point.Rotate(o, angle, center)) }),
        Translate: (polygon: IPolygon, position: IPoint): IPolygon => ({ vertices: polygon.vertices.map(o => Geometry.Point.Add(o, position)) }),
        Hash: (polygon: IPolygon): string => Geometry.Points.Hash(polygon.vertices),
        WindingNumber: (polygon: IPolygon, point: IPoint) : number => {
            // https://twitter.com/FreyaHolmer/status/1232826293902888960
            // http://geomalgorithms.com/a03-_inclusion.html
    
            let windingNumber = 0;
            for(let i = 0; i < polygon.vertices.length; i++) {
                const currentVertex = polygon.vertices[i];
                const nextVertex = polygon.vertices[(i+1)%polygon.vertices.length];
                if(currentVertex.y <= point.y) {
                    if(nextVertex.y > point.y) {
                        if(Geometry.Point.IsLeftOf(point, { a: currentVertex, b: nextVertex })) {
                            windingNumber++;
                        }
                    }
                }
                else {
                    if(nextVertex.y <= point.y) {
                        if(Geometry.Point.IsRightOf(point,{ a: currentVertex, b: nextVertex })) {
                            windingNumber--;
                        }
                    }
                }
            }
            return windingNumber;
        }
    }

    public static Circle: ICircleStatic = {
        Circumcircle: (circle: ICircle): ICircle => circle,
        Supertriangle: (circle: ICircle): ITriangle => ({
            a: Geometry.Point.Add(Geometry.Point.Scale(Geometry.Point.Up, circle.radius * 2), circle),
            b: Geometry.Point.Add(Geometry.Point.Scale(Geometry.Point.Rotate(Geometry.Point.Up, tau/3), circle.radius * 2), circle),
            c: Geometry.Point.Add(Geometry.Point.Scale(Geometry.Point.Rotate(Geometry.Point.Up, tau*2/3), circle.radius * 2), circle)
        }),
        Bounds: (circle: ICircle): IRectangle => ({
            x: circle.x - circle.radius,
            y: circle.y - circle.radius,
            w: circle.radius * 2,
            h: circle.radius * 2
        }),
        Midpoint: (circle: ICircle): IPoint => circle,
        Area: (circle: ICircle): number => Math.PI * circle.radius * circle.radius,
        Circumference: (circle: ICircle): number => tau * circle.radius,
        Hash: (circle: ICircle): string => `${Geometry.Point.Hash(circle)},${circle.radius.toFixed(Geometry.HashDecimalDigits)}`,
        RandomPointInside: (circle: ICircle): IPoint => Geometry.Point.Add(circle, Geometry.Point.Vector(circle.radius * random(), tau * random())),
        Translate: (circle: ICircle, translation: IPoint): ICircle => ({ x: circle.x + translation.x, y: circle.y + translation.y, radius: circle.radius }),
        Rotate: (circle: ICircle, angle: number, center?: IPoint): ICircle => ({
            ...Geometry.Point.Rotate(circle, angle, center),
            radius: circle.radius
        }),
        TangentPoints: (circle: ICircle, point: IPoint): { a: IPoint, b: IPoint } | null => {
            const distanceSq = Geometry.Point.DistanceSq(circle, point);
            if(distanceSq <= 0 || circle.radius <= 0 || distanceSq < circle.radius * circle.radius)
                return null;
            const angle = Geometry.Point.Angle(Geometry.Point.Subtract(point, circle));
            const angleDiff = Math.acos(circle.radius / Math.sqrt(distanceSq));
            return {
                a: Geometry.Point.Add(circle, Geometry.Point.Vector(circle.radius, angle + angleDiff)),
                b: Geometry.Point.Add(circle, Geometry.Point.Vector(circle.radius, angle - angleDiff))
            }
        }
    }

    public static Points: IPointsStatic = {
        Segments: (points: IPoint[], closed: boolean=true): ISegment[] => { 
            const segments = [];
            for(let i = 0; i < points.length; i++) {
                if(i == points.length-1 && !closed)
                    break;
                const j = (i + 1) % points.length;
                segments.push({ a: points[i], b: points[j] });
            }
            return segments;
        },
        Vertices: (points: IPoint[]): IPoint[] => points.clone(),
        Circumcircle: (points: IPoint[]): ICircle => {
            // Doesn't necessarily fit tightly, but is guaranteed to contain all the points
            const center = Geometry.Point.Midpoint(...points);
            const furthest = points.maxOf(o => Geometry.Point.DistanceSq(center, o));
            const radius = Geometry.Point.Distance(furthest, center);
            return { x: center.x, y: center.y, radius };
        },
        Supertriangle: (points: IPoint[]): ITriangle => {
            const circumcircle = Geometry.Points.Circumcircle(points);
            const diameter = circumcircle.radius * 2;
            return {
                a: Geometry.Point.Add(Geometry.Point.Scale(Geometry.Point.Up, diameter), circumcircle),
                b: Geometry.Point.Add(Geometry.Point.Scale(Geometry.Point.Rotate(Geometry.Point.Up, tau/3), diameter), circumcircle),
                c: Geometry.Point.Add(Geometry.Point.Scale(Geometry.Point.Rotate(Geometry.Point.Up, tau*2/3), diameter), circumcircle)
            };
        },
        Triangulation: (points: IPoint[]): ITriangle[] => {
            // http://paulbourke.net/papers/triangulate/
    
            // add supertriangle to points and triangles lists
            const supertriangle: ITriangle = Geometry.Points.Supertriangle(points);
            const supertriangleVertices = Geometry.Triangle.Vertices(supertriangle);
            const triangles: ITriangle[] = [supertriangle];
            points.push(...supertriangleVertices);
    
            // create new points because they'll be added to the later triangles anyway
            points.forEach(point => {
    
                // find all triangles whose circumcircle collides with the given point, remove them, and aggregate their segments into a list
                const segments: ISegment[] = [];
                triangles.removeWhere(triangle => {
                    const circumcircle = Geometry.Triangle.Circumcircle(triangle);
                    const collides = Geometry.Collide.CirclePoint(circumcircle, point);
                    if(collides) {
                        segments.push(...Geometry.Triangle.Segments(triangle));
                        return true;
                    }
                    return false;
                });
    
                // remove all internal segments (those that appear twice in the list)
                segments.removeWhere(segmentA => {
                    const hash = Geometry.Segment.Hash(segmentA);
                    const equivalentSegments = segments.filter(segmentB => Geometry.Segment.Hash(segmentB) === hash);
                    return equivalentSegments.length >= 2;
                });
    
                // form triangles out of each segment and the given point and add them to the triangles list
                const newTriangles: ITriangle[] = segments
                    .filter(segment => 
                        !Geometry.Point.AreEqual(segment.a, segment.b) &&
                        !Geometry.Point.AreEqual(segment.a, point) &&
                        !Geometry.Point.AreEqual(segment.b, point)
                    ).map(segment => ({
                        a: segment.b,
                        b: segment.a,
                        c: point
                    }));
                triangles.push(...newTriangles);
            });
    
            // remove any triangles that share a vertex with the supertriangle
            triangles.removeWhere(triangle => 
                supertriangleVertices.any(stVertex => 
                    Geometry.Triangle.Vertices(triangle).any(vertex => 
                        Geometry.Point.AreEqual(stVertex, vertex))));
            
            // return the input list to its original form
            points.pop();
            points.pop();
            points.pop();
    
            return triangles;
        },
        Bounds: (points: IPoint[]): IRectangle => {
            if(points == null || points.length <= 0)
                return { x: 0, y: 0, w: 0, h: 0 };
            const xMin = points.minOf(o => o.x).x;
            const yMin = points.minOf(o => o.y).y;
            const xMax = points.maxOf(o => o.x).x;
            const yMax = points.maxOf(o => o.y).y;
            return { x: xMin, y: yMin, w: xMax - xMin, h: yMax - yMin };
        },
        Hash: (points: IPoint[]): string => points
            .sorted((a, b) => a.y == b.y ? a.x - b.x : a.y - b.y)
            .map(o => Geometry.Point.Hash(o))
            .join(';'),
        Sum: (points: IPoint[]): IPoint => {
            const sum = { x: 0, y: 0 };
            points.forEach(point => {
                sum.x += point.x;
                sum.y += point.y;
            });
            return sum;
        },
        BezierPoint: (points: IPoint[], t: number): IPoint => {
            const n = points.length - 1;
            let sum = { x: 0, y: 0 };
            for(let i = 0; i < points.length; i++)
            {
                const point = points[i];
                const binomial = binomialCoefficient(n, i);
                const scalar = binomial * Math.pow(1 - t, n - i) * Math.pow(t, i);
                const pointToAdd = Geometry.Point.Scale(point, scalar);
                sum.x += pointToAdd.x;
                sum.y += pointToAdd.y;
            }
            return sum;
        },
        // count must be greater than 1
        Bezier: (points: IPoint[], count: number): IPoint[] => {
            if(points.length <= 0 || count < 1)
                return [];
            if(count === 1)
                return [points.first()];
            const bezierPoints = [];
            const coarseness = 1 / (count-1);
            for(let i = 0; i <= 1; i += coarseness)
                bezierPoints.push(Geometry.Points.BezierPoint(points, i));
            return bezierPoints;
        }
    }

    // TODO:
    //  1. include segments, rays, and lines vs. shapes
    //  2. create matching functions in Geometry.Intersection that actually returns intersection points, if any
    public static Collide = {
        SegmentsSegments: (segmentsA: ISegment[], segmentsB: ISegment[]): boolean =>
            segmentsA.any(segmentA => 
                segmentsB.any(segmentB => 
                    Geometry.Intersection.SegmentSegment(segmentA, segmentB) != null)),
        RectangleRectangle: (rectangleA: IRectangle, rectangleB: IRectangle): boolean =>
            rectangleA.x + rectangleA.w > rectangleB.x 
                && rectangleA.y + rectangleA.h > rectangleB.y 
                && rectangleA.x < rectangleB.x + rectangleB.w 
                && rectangleA.y < rectangleB.y + rectangleB.h,
        RectangleCircle: (rectangle: IRectangle, circle: ICircle, rectangleAngle: number=0): boolean => {
            // The rectangle's (x, y) position is its top-left corner if it were not rotated,
            // however the rectangle still rotates about its center (by "rectangleAngle" radians)
            //https://stackoverflow.com/questions/401847/circle-rectangle-collision-detection-intersection
            const halfW = rectangle.w/2;
            const halfH = rectangle.h/2;
            const circlePosition = rectangleAngle === 0
                ? circle
                : Geometry.Point.Rotate(circle, -rectangleAngle, { x: rectangle.x + halfW, y: rectangle.y + halfH });
            const xCircleDistance = Math.abs(circlePosition.x - (rectangle.x + halfW));
            const yCircleDistance = Math.abs(circlePosition.y - (rectangle.y + halfH));
    
            if (xCircleDistance > halfW + circle.radius || yCircleDistance > halfH + circle.radius)
                return false;
            if (xCircleDistance <= halfW || yCircleDistance <= halfH)
                return true;
    
            const cornerDistanceSq =
                (xCircleDistance - halfW) * (xCircleDistance - halfW) +
                (yCircleDistance - halfH) * (yCircleDistance - halfH);
            return cornerDistanceSq <= (circle.radius * circle.radius);
        },
        RectangleTriangle: (rectangle: IRectangle, triangle: ITriangle): boolean =>
            Geometry.Collide.SegmentsSegments(Geometry.Triangle.Segments(triangle), Geometry.Rectangle.Segments(rectangle))
            || Geometry.Collide.TrianglePoint(triangle, rectangle)
            || Geometry.Collide.RectanglePoint(rectangle, triangle.a),
        RectanglePolygon: (rectangle: IRectangle, polygon: IPolygon): boolean => 
            Geometry.Collide.SegmentsSegments(Geometry.Polygon.Segments(polygon), Geometry.Rectangle.Segments(rectangle))
            || Geometry.Collide.PolygonPoint(polygon, rectangle)
            || Geometry.Collide.RectanglePoint(rectangle, polygon.vertices.first()),
        RectanglePoint: (rectangle: IRectangle, point: IPoint): boolean =>
            point.x >= rectangle.x && point.y >= rectangle.y && point.x < rectangle.x + rectangle.w && point.y < rectangle.y + rectangle.h,
        CircleCircle: (circleA: ICircle, circleB: ICircle): boolean =>
            Geometry.Point.DistanceSq(circleA, circleB) <= (circleA.radius + circleB.radius) * (circleA.radius + circleB.radius),
        CircleTriangle: (circle: ICircle, triangle: ITriangle): boolean => 
            Geometry.Triangle.Segments(triangle).any(segment => Geometry.Intersection.CircleSegment(circle, segment).length > 0)
            || Geometry.Collide.TrianglePoint(triangle, circle)
            || Geometry.Collide.CirclePoint(circle, triangle.a),
        CirclePolygon: (circle: ICircle, polygon: IPolygon): boolean => 
            Geometry.Polygon.Segments(polygon).any(segment => Geometry.Intersection.CircleSegment(circle, segment).length > 0)
            || Geometry.Collide.PolygonPoint(polygon, circle)
            || Geometry.Collide.CirclePoint(circle, polygon.vertices.first()),
        CirclePoint: (circle: ICircle, point: IPoint): boolean =>
            Geometry.Point.DistanceSq(point, circle) <= circle.radius * circle.radius,
        TriangleTriangle: (triangleA: ITriangle, triangleB: ITriangle): boolean => 
            Geometry.Collide.SegmentsSegments(Geometry.Triangle.Segments(triangleA), Geometry.Triangle.Segments(triangleB))
            || Geometry.Collide.TrianglePoint(triangleA, triangleB.a)
            || Geometry.Collide.TrianglePoint(triangleB, triangleA.a),
        TrianglePolygon: (triangle: ITriangle, polygon: IPolygon): boolean =>
            Geometry.Collide.SegmentsSegments(Geometry.Polygon.Segments(polygon), Geometry.Triangle.Segments(triangle))
            || Geometry.Collide.PolygonPoint(polygon, triangle.a)
            || Geometry.Collide.TrianglePoint(triangle, polygon.vertices.first()),
        TrianglePoint: (triangle: ITriangle, point: IPoint): boolean => { 
            // https://stackoverflow.com/questions/2049582/how-to-determine-if-a-point-is-in-a-2d-triangle
            const areaSigned2xInverse =  1 / (
                -triangle.b.y * triangle.c.x 
                + triangle.a.y * (-triangle.b.x + triangle.c.x) 
                + triangle.a.x * (triangle.b.y - triangle.c.y) 
                + triangle.b.x * triangle.c.y
            );
            const s = areaSigned2xInverse*(triangle.a.y*triangle.c.x - triangle.a.x*triangle.c.y + (triangle.c.y - triangle.a.y)*point.x + (triangle.a.x - triangle.c.x)*point.y);
            const t = areaSigned2xInverse*(triangle.a.x*triangle.b.y - triangle.a.y*triangle.b.x + (triangle.a.y - triangle.b.y)*point.x + (triangle.b.x - triangle.a.x)*point.y);
            return s > 0 && t > 0 && 1 - s - t > 0;
        },
        PolygonPolygon: (polygonA: IPolygon, polygonB: IPolygon): boolean =>
            Geometry.Collide.SegmentsSegments(Geometry.Polygon.Segments(polygonA), Geometry.Polygon.Segments(polygonB))
            || Geometry.Collide.PolygonPoint(polygonA, polygonB.vertices.first())
            || Geometry.Collide.PolygonPoint(polygonB, polygonA.vertices.first()),
        PolygonPoint: (polygon: IPolygon, point: IPoint): boolean =>
            Geometry.Polygon.WindingNumber(polygon, point) != 0
    }


    // given 3 colinear points, returns true if "b" and "c" are on the same side of "a"
    // returns true when "b" or "c" is equal to "a"
    // i.e. used to check if a point has exceeded the endpoint of a PointPair
    //  a = endpoint of PointPair being checked
    //  b = other endpoint of the same PointPair
    //  c = point being checked against the PointPair)
    // TODO: rename 
    private static isSameSideOfPoint = (a: IPoint, b: IPoint, c: IPoint) =>
        a.x === b.x
            ? (Math.sign(c.y - a.y) === Math.sign(b.y - a.y) || Math.sign(c.y - a.y) === 0 || Math.sign(b.y - a.y) === 0)
            : (Math.sign(c.x - a.x) === Math.sign(b.x - a.x) || Math.sign(c.x - a.x) === 0 || Math.sign(b.x - a.x) === 0);

    // TODO:
    //  1. test what happens when the lines/rays/segments are directly atop one another
    //  2. add shape vs. shape intersections as well
    public static Intersection = {
        CirclePointPair: (circle: ICircle, pair: IPointPair): IPoint[] => {
            const b = Geometry.Line.Yintercept(pair);
            const m = Geometry.Line.Slope(pair);
            const t = 1 + m * m;
            const u = 2 * b * m - 2 * circle.y * m - 2 * circle.x;
            const v = circle.x * circle.x + b * b + circle.y * circle.y - circle.radius * circle.radius - 2 * b * circle.y;

            const sq = u * u - 4 * t * v;
            if(sq < 0)
                return [];
            
            if(sq == 0) {
                const x = -u / (2 * t);
                const y = m * x + b;
                return [{ x, y }];
            }

            const sqrt = Math.sqrt(sq);
            const x1 = (-u + sqrt) / (2 * t);
            const y1 = m * x1 + b;
            const x2 = (-u - sqrt) / (2 * t);
            const y2 = m * x2 + b;
            return [
                { x: x1, y: y1 },
                { x: x2, y: y2 }
            ];
        },
        CircleLine: (circle: ICircle, line: ILine): IPoint[] =>
            Geometry.Intersection.CirclePointPair(circle, line),
        CircleRay: (circle: ICircle, ray: IRay): IPoint[] =>
            Geometry.Intersection.CirclePointPair(circle, ray)
                .filter(o => Geometry.isSameSideOfPoint(ray.a, ray.b, o)),
        CircleSegment: (circle: ICircle, segment: ISegment): IPoint[] =>
            Geometry.Intersection.CirclePointPair(circle, segment)
                .filter(o =>
                    Geometry.isSameSideOfPoint(segment.a, segment.b, o) && 
                    Geometry.isSameSideOfPoint(segment.b, segment.a, o)
                ),
        LineLine: (lineA: ILine, lineB: ILine): IPoint | null =>
            Geometry.Intersection.PointPair(lineA, PointPairType.LINE, lineB, PointPairType.LINE),
        LineRay: (line: ILine, ray: IRay): IPoint | null =>
            Geometry.Intersection.PointPair(line, PointPairType.LINE, ray, PointPairType.RAY),
        LineSegment: (line: ILine, segment: ISegment): IPoint | null =>
            Geometry.Intersection.PointPair(line, PointPairType.LINE, segment, PointPairType.SEGMENT),
        RayRay: (rayA: IRay, rayB: IRay): IPoint | null =>
            Geometry.Intersection.PointPair(rayA, PointPairType.RAY, rayB, PointPairType.RAY),
        RaySegment: (ray: IRay, segment: ISegment): IPoint | null =>
            Geometry.Intersection.PointPair(ray, PointPairType.RAY, segment, PointPairType.SEGMENT),
        SegmentSegment: (segmentA: ISegment, segmentB: ISegment): IPoint | null =>
            Geometry.Intersection.PointPair(segmentA, PointPairType.SEGMENT, segmentB, PointPairType.SEGMENT),
        SegmentsSegments: (segmentsA: ISegment[], segmentsB: ISegment[]): IPoint[] =>
            segmentsA.map(segmentA => 
                segmentsB.map(segmentB => 
                    Geometry.Intersection.SegmentSegment(segmentA, segmentB)
                ).filter(o => o != null)
            ).flattened(),
        PolygonPolygon: (polygonA: IPolygon, polygonB: IPolygon): IPoint[] =>
            Geometry.Intersection.SegmentsSegments(Geometry.Polygon.Segments(polygonA), Geometry.Polygon.Segments(polygonB)),
        PointPair: (
            first: IPointPair, firstType: PointPairType, 
            second: IPointPair, secondType: PointPairType
        ): IPoint | null => {
            const yFirstLineDiff = first.b.y - first.a.y;
            const xFirstLineDiff = first.a.x - first.b.x;
            const cFirst = first.b.x * first.a.y - first.a.x * first.b.y;
            const ySecondLineDiff = second.b.y - second.a.y;
            const xSecondLineDiff = second.a.x - second.b.x;
            const cSecond = second.b.x * second.a.y - second.a.x * second.b.y;
    
            const denominator = yFirstLineDiff * xSecondLineDiff - ySecondLineDiff * xFirstLineDiff;
            if (denominator === 0)
                return null;
            const intersection = {
                x: (xFirstLineDiff * cSecond - xSecondLineDiff * cFirst) / denominator,
                y: (ySecondLineDiff * cFirst - yFirstLineDiff * cSecond) / denominator
            };
    
            const beyondFirstA = !Geometry.isSameSideOfPoint(first.a, first.b, intersection);
            const beyondFirstB = !Geometry.isSameSideOfPoint(first.b, first.a, intersection);
            const beyondSecondA = !Geometry.isSameSideOfPoint(second.a, second.b, intersection);
            const beyondSecondB = !Geometry.isSameSideOfPoint(second.b, second.a, intersection)
    
            return firstType === PointPairType.SEGMENT && (beyondFirstA || beyondFirstB)
                || firstType === PointPairType.RAY && beyondFirstA
                || secondType === PointPairType.SEGMENT && (beyondSecondA || beyondSecondB)
                || secondType === PointPairType.RAY && beyondSecondA
                    ? null
                    : intersection;
        }
    }
}