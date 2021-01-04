export interface IPoint {
    x: number;
    y: number;
}

export interface ICircle extends IPoint {
    radius: number
}

export interface IRectangle extends IPoint {
    w: number;
    h: number;
}

export interface ITriangle {
    a: IPoint;
    b: IPoint;
    c: IPoint;
}

export interface IPointPair {
    a: IPoint,
    b: IPoint
}
export interface ILine extends IPointPair {}
export interface IRay extends IPointPair {}
export interface ISegment extends IPointPair {}

export interface IRaycastResult<T extends ISegment> {
    contactPoint: IPoint,
    segmentHit: T
}

export interface IPolygon {
    vertices: IPoint[]; // counter-clockwise order
    // segments: ISegment[];
    // triangulation: ITriangle[];
    // circumcircle: ICircle;
    // bounds: IRectangle;
    // area: number;

    // // TODO:
    // // collidesPolygon(polygon: IPolygon): boolean;
    // // collidesRectangle(rectangle: IRectangle): boolean;
    // // collidesTriangle(triangle: ITriangle): boolean;
    // // collidesCircle(circle: ICircle, rectangleAngle: number=0): boolean
    // collidesPoint(point: IPoint): boolean;
    // lineIntersections(line: ILine): IPoint[];
    // rayIntersections(ray: IRay): IPoint[];
    // segmentIntersections(segment: ISegment): IPoint[];    
}

export enum PointPairType {
    LINE = "LINE",
    SEGMENT = "SEGMENT",
    RAY = "RAY"
}