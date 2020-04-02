import { Color } from './color';
import { World } from '@engine-ts/core/world';
import { tau, Halign, Valign } from '@engine-ts/core/utils';
import { ColorStopArray } from './color-stop-array';
import { BlendMode } from './blend-mode';
import { ICircle, IPoint, ITriangle, IRectangle, ILine, IRay, ISegment, IPolygon } from '@engine-ts/geometry/interfaces';
// TODO: use IPoint everywhere instead
import { Point } from '@engine-ts/geometry/point';
import { Geometry } from '@engine-ts/geometry/geometry';

export type FillStyle = Color | string | null;
export type StrokeStyle = FillStyle;
export type HalignAll = Halign | "left" | "center" | "right" | "start" | "end";
export type ValignAll = Valign | "top" | "hanging" | "middle" | "alphabetic" | "ideographic" | "bottom";

// TODO: remove world from this doc and instead create a world.draw property which has all these
// same functions and simply calls the below functions after applying the world's camera position, zoom level, etc.
export class Draw {
    public static circle(world: World, circle: ICircle, fillStyle: FillStyle=null) {
        if(circle.radius <= 0)
            return;    
        const context = world.context;
        context.beginPath();
        context.arc(circle.x - world.camera.x, circle.y - world.camera.y, circle.radius, 0, tau);
        if(fillStyle)
            context.fillStyle = fillStyle.toString();
        context.fill();
    };

    public static circleOutline(world: World, circle: ICircle, strokeStyle: StrokeStyle=null, lineWidth: number=1) {
        if(circle.radius <= 0 || lineWidth <= 0)
            return;
        const context = world.context;
        context.beginPath();
        context.arc(circle.x - world.camera.x, circle.y - world.camera.y, circle.radius, 0, tau);
        context.lineWidth = lineWidth;
        if(strokeStyle)
            context.strokeStyle = strokeStyle.toString();
        context.stroke();
    };

    // same as circleOutline except you specify the inner and outer radii
    public static ring(world: World, position: IPoint, innerRadius: number, outerRadius: number, strokeStyle: StrokeStyle=null) {
        if(outerRadius <= 0)
            return;
        const lineWidth = outerRadius - innerRadius;
        const radius = (outerRadius + innerRadius) / 2;
        Draw.circleOutline(world, { x: position.x, y: position.y, radius }, strokeStyle, lineWidth);
    };

    public static oval(world: World, position: IPoint, xRadius: number, yRadius: number, fillStyle: FillStyle=null, angle: number=0) {
        if(xRadius <= 0 || yRadius <= 0)
            return;
        const context = world.context;
        context.beginPath();
        context.ellipse(position.x - world.camera.x, position.y - world.camera.y, xRadius, yRadius, angle, 0, tau);
        if(fillStyle)
            context.fillStyle = fillStyle.toString();
        context.fill();
    };

    public static ovalOutline(world: World, position: IPoint, xRadius: number, yRadius: number, strokeStyle: StrokeStyle=null, angle: number=0, lineWidth: number=1) {
        if(xRadius <= 0 || yRadius <= 0)
            return;
        const context = world.context;
        context.beginPath();
        context.ellipse(position.x - world.camera.x, position.y - world.camera.y, xRadius, yRadius, angle, 0, tau);
        context.lineWidth = lineWidth;
        if(strokeStyle)
            context.strokeStyle = strokeStyle.toString();
        context.stroke();
    };

    public static triangle(world: World, triangle: ITriangle, fillStyle: FillStyle=null) {
        const context = world.context;
        context.beginPath();
        context.moveTo(triangle.a.x - world.camera.x, triangle.a.y - world.camera.y);
        context.lineTo(triangle.b.x - world.camera.x, triangle.b.y - world.camera.y);
        context.lineTo(triangle.c.x - world.camera.x, triangle.c.y - world.camera.y);
        if(fillStyle)
            context.fillStyle = fillStyle.toString();
        context.fill();
    };

    public static triangleOutline(world: World, triangle: ITriangle, strokeStyle: StrokeStyle=null, lineWidth: number=1) {
        const context = world.context;
        context.beginPath();
        context.moveTo(triangle.a.x - world.camera.x, triangle.a.y - world.camera.y);
        context.lineTo(triangle.b.x - world.camera.x, triangle.b.y - world.camera.y);
        context.lineTo(triangle.c.x - world.camera.x, triangle.c.y - world.camera.y);
        context.closePath();
        context.lineWidth = lineWidth;
        if(strokeStyle)
            context.strokeStyle = strokeStyle.toString();
        context.stroke();
    };

    public static polygon(world: World, { vertices }: IPolygon, fillStyle: FillStyle=null) {
        if(vertices.length <= 0)
            return;
        const context = world.context;
        context.beginPath();
        context.moveTo(vertices.first().x - world.camera.x, vertices.first().y - world.camera.y);
        for(let i = 1; i < vertices.length; i++)
            context.lineTo(vertices[i].x - world.camera.x, vertices[i].y - world.camera.y);
        context.closePath();
        if(fillStyle)
            context.fillStyle = fillStyle.toString();
        context.fill();
    };

    public static polygonOutline(world: World, { vertices }: IPolygon, strokeStyle: StrokeStyle=null, lineWidth: number=1) {
        if(vertices.length <= 0)
            return;
        const context = world.context;
        context.beginPath();
        context.moveTo(vertices.first().x - world.camera.x, vertices.first().y - world.camera.y);
        for(let i = 1; i < vertices.length; i++)
            context.lineTo(vertices[i].x - world.camera.x, vertices[i].y - world.camera.y);
        context.closePath();
        context.lineWidth = lineWidth;
        if(strokeStyle)
            context.strokeStyle = strokeStyle.toString();
        context.stroke();
    };

    public static regularPolygon(world: World, position: IPoint, radius: number, sides: number, fillStyle: FillStyle=null, angle: number=0) {
        const context = world.context;
        const points = Draw._getRegularPolygonPoints(position, radius, sides, angle);
        if(points.length <= 0)
            return;
        context.beginPath();
        for(let i = 0; i < points.length; i++)
        {
            const point = points[i].subtract(world.camera);
            if(i === 0)
                context.moveTo(point.x, point.y);
            else
                context.lineTo(point.x, point.y);
        }
        if(fillStyle)
            context.fillStyle = fillStyle.toString();
        context.fill();
    };

    public static regularPolygonOutline(world: World, position: IPoint, radius: number, sides: number, strokeStyle: StrokeStyle=null, angle: number=0, lineWidth: number=1) {
        const context = world.context;
        const points = Draw._getRegularPolygonPoints(position, radius, sides, angle);
        if(points.length <= 0)
            return;
        points.push(points.first());
        context.beginPath();
        for(let i = 0; i < points.length; i++)
        {
            const point = points[i].subtract(world.camera);
            if(i === 0)
                context.moveTo(point.x, point.y);
            else
                context.lineTo(point.x, point.y);
        }
        context.lineWidth = lineWidth;
        if(strokeStyle)
            context.strokeStyle = strokeStyle.toString();
        context.stroke();
    };

    private static _getRegularPolygonPoints(position: IPoint, radius: number, sides: number, angle: number) {
        if(sides <= 0)
            throw `Cannot create a regular polygon with ${sides} sides`;
        const points = [];
        for(let i = 0; i < sides; i++)
        {
            const angleToCorner = tau * i / sides + angle;
            const point = Point.Vector(radius, angleToCorner).add(position);
            points.push(point);
        }
        return points;
    };

    public static rectangle(world: World, rectangle: IRectangle, fillStyle: FillStyle=null, angle: number=0, center?: IPoint) {        
        const context = world.context;
        if(fillStyle)
            context.fillStyle = fillStyle.toString();

        if(angle === 0) {
            context.fillRect(rectangle.x - world.camera.x, rectangle.y - world.camera.y, rectangle.w, rectangle.h);
            return;
        }
        
        center = center || Geometry.Point.Subtract(Geometry.Rectangle.Center(rectangle), world.camera);
        context.translate(center.x, center.y);
        context.rotate(angle);
        context.fillRect(rectangle.x - center.x, rectangle.y - center.y, rectangle.w, rectangle.h);
        context.rotate(-angle);
        context.translate(-center.x, -center.y);
    };
    
    public static rectangleOutline(world: World, rectangle: IRectangle, strokeStyle: StrokeStyle=null, lineWidth: number=1, angle: number = 0) {
        let points: IPoint[] = Geometry.Rectangle.Vertices(rectangle)
        if(angle !== 0) {
            const center = new Point(rectangle.x + rectangle.w/2, rectangle.y + rectangle.h/2);
            points = points.map(point => Geometry.Point.Rotate(point, angle, center));
        }
        Draw.path(world, points, strokeStyle, lineWidth, true);
    };
    
    public static rectangleGradientVertical(world: World, rectangle: IRectangle, colorStopArray: ColorStopArray) {
        const context = world.context;
        const diff = new Point(rectangle.x, rectangle.y).subtract(world.camera);
        const gradient = context.createLinearGradient(diff.x, diff.y, diff.x, diff.y + rectangle.h);
        colorStopArray.applyToGradient(gradient);
        context.fillStyle = gradient;
        context.fillRect(diff.x, diff.y, rectangle.w, rectangle.h);
    };
    
    public static rectangleGradientHorizontal(world: World, rectangle: IRectangle, colorStopArray: ColorStopArray) {
        const context = world.context;
        const diff = new Point(rectangle.x, rectangle.y).subtract(world.camera);
        const gradient = context.createLinearGradient(diff.x, diff.y, diff.x + rectangle.w, diff.y);
        colorStopArray.applyToGradient(gradient);
        context.fillStyle = gradient;
        context.fillRect(diff.x, diff.y, rectangle.w, rectangle.h);
    };

    public static line(world: World, line: ILine, strokeStyle: StrokeStyle=null, lineWidth: number=1) {
        if(lineWidth <= 0)
            return;

        const points = world.camera.lineIntersections(line);
        if(points.length < 2)
            return;

        const context = world.context;
        context.beginPath();
        context.moveTo(points[0].x - world.camera.x, points[0].y - world.camera.y);
        context.lineTo(points[1].x - world.camera.x, points[1].y - world.camera.y);
        if(strokeStyle)
            context.strokeStyle = strokeStyle.toString();
        context.lineWidth = lineWidth;
        context.stroke();
    };

    public static ray(world: World, ray: IRay, strokeStyle: StrokeStyle=null, lineWidth: number=1) {
        if(lineWidth <= 0)
            return;

        const context = world.context;
        const points = world.camera.rayIntersections(ray);
        if(points.length === 1) {
            context.beginPath();
            context.moveTo(ray.a.x - world.camera.x, ray.a.y - world.camera.y);
            context.lineTo(points[0].x - world.camera.x, points[0].y - world.camera.y);
            if(strokeStyle)
                context.strokeStyle = strokeStyle.toString();
            context.lineWidth = lineWidth;
            context.stroke();
            return;
        }  

        if(points.length !== 2)
            return;

        context.beginPath();
        context.moveTo(points[0].x - world.camera.x, points[0].y - world.camera.y);
        context.lineTo(points[1].x - world.camera.x, points[1].y - world.camera.y);
        if(strokeStyle)
            context.strokeStyle = strokeStyle.toString();
        context.lineWidth = lineWidth;
        context.stroke();
    };

    public static segment(world: World, segment: ISegment, strokeStyle: StrokeStyle=null, lineWidth: number=1) {
        if(lineWidth <= 0)
            return;
        const context = world.context;
        context.beginPath();
        context.moveTo(segment.a.x - world.camera.x, segment.a.y - world.camera.y);
        context.lineTo(segment.b.x - world.camera.x, segment.b.y - world.camera.y);
        if(strokeStyle)
            context.strokeStyle = strokeStyle.toString();
        context.lineWidth = lineWidth;
        context.stroke();
    };

    public static path(world: World, points: IPoint[], strokeStyle: StrokeStyle=null, lineWidth: number=1, closePath: boolean=false) {
        if(lineWidth <= 0 || points.length <= 0)
            return;
        const context = world.context;
        context.beginPath();
        context.moveTo(points[0].x - world.camera.x, points[0].y - world.camera.y);
        for(let i = 1; i < points.length; i++)
            context.lineTo(points[i].x - world.camera.x, points[i].y - world.camera.y);
        if(closePath)
            context.closePath();
        if(strokeStyle)
            context.strokeStyle = strokeStyle.toString();;
        context.lineWidth = lineWidth;
        context.stroke();
    };

    public static text(world: World, text: string, position: IPoint, fillStyle: FillStyle=null, font: string | null=null, halign:HalignAll="left", valign:ValignAll="top") {
        const context = world.context;
        Draw.textStyle(world, fillStyle, font, halign, valign);
        context.fillText(text, position.x - world.camera.x, position.y - world.camera.y);
    };

    public static textStyle(world: World, fillStyle: FillStyle=null, font: string | null=null, halign: HalignAll=null, valign: ValignAll=null) {
        const context = world.context;
        if(font)
            context.font = font;
        if(halign)
            context.textAlign = halign;
        if(fillStyle)
            context.fillStyle = fillStyle.toString();
        if(valign)
            context.textBaseline = valign;
    };

    public static textWidth(world: World, text: string, font: string | null=null) {
        const context = world.context;
        if(font)
            context.font = font;
        return context.measureText(text).width;
    };

    // uses width of a capital 'M' to estimate height of text
    public static textHeight(world: World, font: string | null=null) {
        const context = world.context;
        if(font)
            context.font = font;
        return context.measureText('M').width;
    }

    // Example:
    // Draw.applyBlendMode(world, BlendMode.Overlay, () =>
    // {
    //     Draw.circle(world, 50, 50, 10, Color.red);
    // });
    public static applyBlendMode(world: World, blendMode: BlendMode, drawCall: () => void)
    {
        const context = world.context;
        const blendModeOriginal = context.globalCompositeOperation.toString();
        context.globalCompositeOperation = blendMode;
        drawCall();
        context.globalCompositeOperation = blendModeOriginal;
    };
}