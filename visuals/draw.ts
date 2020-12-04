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

interface CameraContext {
    camera: IPoint,
    context: CanvasRenderingContext2D,
}

// TODO: remove world from this doc and instead create a world.draw property which has all these
// same functions and simply calls the below functions after applying the world's camera position, zoom level, etc.
export class Draw {
    public static image(world: World, imageName: string, position: IPoint, scale: IPoint=Geometry.Point.One, angle: number=0, center?:IPoint, alpha:number=1) {
        const context = world.context;
        const image = world.images.get(imageName);
        if(!image) {
            return;
        }

        const w = Math.abs(scale.x * (image.width as number));
        const h = Math.abs(scale.y * (image.height as number));

        const globalAlphaPrevious = context.globalAlpha;
        context.globalAlpha = alpha;

        const cx = (center?.x ?? (position.x + w/2)) - world.camera.x;
        const cy = (center?.y ?? (position.y + h/2)) - world.camera.y;
        const px = position.x + w/2 - world.camera.x;
        const py = position.y + h/2 - world.camera.y;
        context.translate(cx, cy);
        if(angle !== 0)
            context.rotate(-angle);
        context.scale(Math.sign(scale.x), Math.sign(scale.y));
        context.translate(px - cx, py - cy);
        context.drawImage(image, -w/2, -h/2, w, h);
        context.resetTransform();

        context.globalAlpha = globalAlphaPrevious;
    }
    
    public static imagePart(world: World, imageName: string, position: IPoint, sx: number, sy: number, sw: number, sh: number, scale: IPoint=Geometry.Point.One, angle: number=0, center?:IPoint, alpha:number=1) {
        const context = world.context;
        const image = world.images.get(imageName);
        if(!image) {
            return;
        }
        const w = Math.abs(scale.x * sw);
        const h = Math.abs(scale.y * sh);

        const globalAlphaPrevious = context.globalAlpha;
        context.globalAlpha = alpha;

        const cx = (center?.x ?? (position.x + w/2)) - world.camera.x;
        const cy = (center?.y ?? (position.y + h/2)) - world.camera.y;
        const px = position.x + w/2 - world.camera.x;
        const py = position.y + h/2 - world.camera.y;
        context.translate(cx, cy);
        if(angle !== 0)
            context.rotate(-angle);
        context.scale(Math.sign(scale.x), Math.sign(scale.y));
        context.translate(px - cx, py - cy);
        context.drawImage(image, sx, sy, sw, sh, -w/2, -h/2, w, h);
        context.resetTransform();

        context.globalAlpha = globalAlphaPrevious;
    }

    public static circleArc(world: CameraContext, circle: ICircle, startAngle: number, endAngle: number, fillStyle: FillStyle=null) {
        if(circle.radius <= 0)
            return;
        const context = world.context;
        context.beginPath();
        context.arc(circle.x - world.camera.x, circle.y - world.camera.y, circle.radius, startAngle, endAngle);
        if(fillStyle)
            context.fillStyle = fillStyle.toString();
        context.fill();
    }

    public static circleArcOutline(world: CameraContext, circle: ICircle, startAngle: number, endAngle: number, strokeStyle: StrokeStyle=null, lineWidth: number=1) {
        if(circle.radius <= 0)
            return;
        const context = world.context;
        context.beginPath();
        context.arc(circle.x - world.camera.x, circle.y - world.camera.y, circle.radius, startAngle, endAngle);
        if(strokeStyle)
            context.strokeStyle = strokeStyle.toString();
        context.lineWidth = lineWidth;
        context.stroke();
    }

    public static circle(world: CameraContext, circle: ICircle, fillStyle: FillStyle=null) {
        this.circleArc(world, circle, 0, tau, fillStyle);
    };

    public static circleOutline(world: CameraContext, circle: ICircle, strokeStyle: StrokeStyle=null, lineWidth: number=1) {
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
    public static ring(world: CameraContext, position: IPoint, innerRadius: number, outerRadius: number, strokeStyle: StrokeStyle=null) {
        if(outerRadius <= 0)
            return;
        const lineWidth = outerRadius - innerRadius;
        const radius = (outerRadius + innerRadius) / 2;
        Draw.circleOutline(world, { x: position.x, y: position.y, radius }, strokeStyle, lineWidth);
    };

    public static ovalArc(world: CameraContext, position: IPoint, xRadius: number, yRadius: number, startAngle: number, endAngle: number, fillStyle: FillStyle=null, angle: number=0) {
        if(xRadius <= 0 || yRadius <= 0)
            return;
        const context = world.context;
        context.beginPath();
        context.ellipse(position.x - world.camera.x, position.y - world.camera.y, xRadius, yRadius, angle, startAngle, endAngle);
        if(fillStyle)
            context.fillStyle = fillStyle.toString();
        context.fill();
    };

    public static oval(world: CameraContext, position: IPoint, xRadius: number, yRadius: number, fillStyle: FillStyle=null, angle: number=0) {
        this.ovalArc(world, position, xRadius, yRadius, 0, tau, fillStyle, angle);
    };

    public static ovalOutline(world: CameraContext, position: IPoint, xRadius: number, yRadius: number, strokeStyle: StrokeStyle=null, angle: number=0, lineWidth: number=1) {
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

    public static triangle(world: CameraContext, triangle: ITriangle, fillStyle: FillStyle=null) {
        const context = world.context;
        context.beginPath();
        context.moveTo(triangle.a.x - world.camera.x, triangle.a.y - world.camera.y);
        context.lineTo(triangle.b.x - world.camera.x, triangle.b.y - world.camera.y);
        context.lineTo(triangle.c.x - world.camera.x, triangle.c.y - world.camera.y);
        if(fillStyle)
            context.fillStyle = fillStyle.toString();
        context.fill();
    };

    public static triangleOutline(world: CameraContext, triangle: ITriangle, strokeStyle: StrokeStyle=null, lineWidth: number=1) {
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

    public static polygon(world: CameraContext, { vertices }: IPolygon, fillStyle: FillStyle=null) {
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

    public static polygonOutline(world: CameraContext, { vertices }: IPolygon, strokeStyle: StrokeStyle=null, lineWidth: number=1) {
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

    public static regularPolygon(world: CameraContext, position: IPoint, radius: number, sides: number, fillStyle: FillStyle=null, angle: number=0) {
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

    public static regularPolygonOutline(world: CameraContext, position: IPoint, radius: number, sides: number, strokeStyle: StrokeStyle=null, angle: number=0, lineWidth: number=1) {
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

    public static rectangle(world: CameraContext, rectangle: IRectangle, fillStyle: FillStyle=null, angle: number=0, center?: IPoint) {        
        const context = world.context;
        if(fillStyle)
            context.fillStyle = fillStyle.toString();

        if(angle === 0) {
            context.fillRect(rectangle.x - world.camera.x, rectangle.y - world.camera.y, rectangle.w, rectangle.h);
            return;
        }
        
        center = center || Geometry.Rectangle.Center(rectangle);
        center = Geometry.Point.Subtract(center, world.camera)
        context.translate(center.x, center.y);
        context.rotate(-angle);
        context.fillRect(rectangle.x - world.camera.x - center.x, rectangle.y - world.camera.y - center.y, rectangle.w, rectangle.h);
        context.resetTransform();
    };
    
    public static rectangleOutline(world: CameraContext, rectangle: IRectangle, strokeStyle: StrokeStyle=null, lineWidth: number=1, angle: number = 0) {
        let points: IPoint[] = Geometry.Rectangle.Vertices(rectangle)
        if(angle !== 0) {
            const center = new Point(rectangle.x + rectangle.w/2, rectangle.y + rectangle.h/2);
            points = points.map(point => Geometry.Point.Rotate(point, angle, center));
        }
        Draw.path(world, points, strokeStyle, lineWidth, true);
    };
    
    public static rectangleGradientVertical(world: CameraContext, rectangle: IRectangle, colorStopArray: ColorStopArray) {
        const context = world.context;
        const diff = new Point(rectangle.x, rectangle.y).subtract(world.camera);
        const gradient = context.createLinearGradient(diff.x, diff.y, diff.x, diff.y + rectangle.h);
        colorStopArray.applyToGradient(gradient);
        context.fillStyle = gradient;
        context.fillRect(diff.x, diff.y, rectangle.w, rectangle.h);
    };
    
    public static rectangleGradientHorizontal(world: CameraContext, rectangle: IRectangle, colorStopArray: ColorStopArray) {
        const context = world.context;
        const diff = new Point(rectangle.x, rectangle.y).subtract(world.camera);
        const gradient = context.createLinearGradient(diff.x, diff.y, diff.x + rectangle.w, diff.y);
        colorStopArray.applyToGradient(gradient);
        context.fillStyle = gradient;
        context.fillRect(diff.x, diff.y, rectangle.w, rectangle.h);
    };

    private static rectangleRoundedPath(world: CameraContext, rectangle: IRectangle, radius: number, angle: number=0, center?: IPoint) {
        const context = world.context;
        center = center || Geometry.Point.Subtract(Geometry.Rectangle.Center(rectangle), world.camera);
        context.translate(center.x, center.y);
        context.rotate(-angle);

        const xOffset = -world.camera.x - center.x;
        const yOffset = -world.camera.y - center.y;
        const xRightHor = rectangle.x + rectangle.w + xOffset;
        const xRightVer = xRightHor - radius;
        const xLeftHor = rectangle.x + xOffset;
        const xLeftVer = xLeftHor + radius;
        const yTopVer = rectangle.y + yOffset;
        const yTopHor = yTopVer + radius;
        const yBottomVer = rectangle.y + rectangle.h + yOffset;
        const yBottomHor = yBottomVer - radius;
        context.beginPath();
        context.moveTo(xLeftVer, yTopVer);
        context.lineTo(xRightVer, yTopVer);
        context.quadraticCurveTo(xRightHor, yTopVer, xRightHor, yTopHor);
        context.lineTo(xRightHor, yBottomHor);
        context.quadraticCurveTo(xRightHor, yBottomVer, xRightVer, yBottomVer);
        context.lineTo(xLeftVer, yBottomVer);
        context.quadraticCurveTo(xLeftHor, yBottomVer, xLeftHor, yBottomHor);
        context.lineTo(xLeftHor, yTopHor);
        context.quadraticCurveTo(xLeftHor, yTopVer, xLeftVer, yTopVer);

        context.rotate(angle);
        context.translate(-center.x, -center.y);
    }

    public static rectangleRounded(world: CameraContext, rectangle: IRectangle, radius: number, fillStyle: FillStyle=null, angle: number=0, center?: IPoint) {
        const context = world.context;
        this.rectangleRoundedPath(world, rectangle, radius, angle, center);
        if(fillStyle)
            context.fillStyle = fillStyle.toString();
        context.fill();
    }

    public static rectangleRoundedOutline(world: CameraContext, rectangle: IRectangle, radius: number, strokeStyle: StrokeStyle=null, lineWidth: number=1, angle: number=0, center?: IPoint) {
        const context = world.context;
        this.rectangleRoundedPath(world, rectangle, radius, angle, center);
        context.lineWidth = lineWidth;
        if(strokeStyle)
            context.strokeStyle = strokeStyle.toString();
        context.stroke();
    }

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

    public static segment(world: CameraContext, segment: ISegment, strokeStyle: StrokeStyle=null, lineWidth: number=1) {
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

    public static path(world: CameraContext, points: IPoint[], strokeStyle: StrokeStyle=null, lineWidth: number=1, closePath: boolean=false) {
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

    public static text(world: CameraContext, text: string, position: IPoint, fillStyle: FillStyle=null, font: string | null=null, halign:HalignAll="left", valign:ValignAll="top", angle: number=0, center?: IPoint) {
        const context = world.context;
        Draw.textStyle(world, fillStyle, font, halign, valign);
        center = center || Geometry.Point.Subtract(position, world.camera);
        context.translate(center.x, center.y);
        context.rotate(-angle);
        context.fillText(text, position.x - world.camera.x - center.x, position.y - world.camera.y - center.y);
        context.rotate(angle);
        context.translate(-center.x, -center.y);
    };

    public static textStyle(world: CameraContext, fillStyle: FillStyle=null, font: string | null=null, halign: HalignAll=null, valign: ValignAll=null) {
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

    public static textWidth(world: CameraContext, text: string, font: string | null=null) {
        const context = world.context;
        if(font)
            context.font = font;
        return context.measureText(text).width;
    };

    // uses width of a capital 'M' to estimate height of text
    public static textHeight(world: CameraContext, font: string | null=null) {
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
    public static applyBlendMode(world: CameraContext, blendMode: BlendMode, drawCall: () => void)
    {
        const context = world.context;
        const blendModeOriginal = context.globalCompositeOperation.toString();
        context.globalCompositeOperation = blendMode;
        drawCall();
        context.globalCompositeOperation = blendModeOriginal;
    };
}