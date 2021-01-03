import { clamp, random } from '@engine-ts/core/utils';
import { PixelGrid } from './pixel-grid';
import { Color } from '@engine-ts/visuals/color';
import { IPoint } from '@engine-ts/geometry/interfaces';
import { Geometry } from '@engine-ts/geometry/geometry';
import { World } from '@engine-ts/core/world';
import { createCanvas } from '@engine-ts/visuals/create-canvas';

export class Perlin {
    private noiseCanvas: HTMLCanvasElement;
    private perlinCanvas: HTMLCanvasElement;
    private perlinPixelGrid: PixelGrid;

    constructor(public readonly w: number, public readonly h: number, alpha: number=1) {
        this.noiseCanvas = createCanvas(w, h);
        this.perlinCanvas = createCanvas(w, h);
        this.refreshRandomNoise(alpha);
        this.refreshPerlinNoise();
        this.perlinPixelGrid = new PixelGrid(this.perlinCanvas);
    }

    refreshRandomNoise(alpha: number=1) {
        const x = 0;
        const y = 0;
        const context = this.noiseCanvas.getContext("2d");
        const imageData = context.getImageData(x, y, this.noiseCanvas.width, this.noiseCanvas.height);
        const pixels = imageData.data;
        for(let i = 0; i < pixels.length; i += 4) {
            // greyscale so set all rgb to the same value
            pixels[i] = pixels[i+1] = pixels[i+2] = (random() * 256) | 0;
            pixels[i+3] = alpha * 255;
        }
        context.putImageData(imageData, x, y);
    };

    getPixelColor(position: IPoint): Color | null {
        return this.perlinPixelGrid.get(position);
    };

    setPixelColor(position: IPoint, color: Color): void {
        return this.perlinPixelGrid.set(position, color);
    };

    // https://gist.github.com/donpark/1796361
    refreshPerlinNoise() {
        const contextDestination = this.perlinCanvas.getContext("2d");
        const canvasSource = this.noiseCanvas;
        for (let size = 4; size <= canvasSource.width; size *= 2) {
            let x = (random() * (canvasSource.width - size)) | 0;
            let y = (random() * (canvasSource.height - size)) | 0;
            contextDestination.globalAlpha = 4 / size;
            contextDestination.drawImage(canvasSource, x, y, size, size, 0, 0, canvasSource.width, canvasSource.height);
        }
    };

    normalizePerlinNoise() {
        const perlinValues = this.perlinPixelGrid.map((position: IPoint, color: Color) => color.red);
        const perlinValuesMin = perlinValues.min();
        const perlinValuesMax = perlinValues.max();

        const filter = (position: IPoint, getColor: (position: IPoint) => Color) => {
            const oldValue = getColor(position).red;
            const normal = (oldValue - perlinValuesMin) / (perlinValuesMax - perlinValuesMin);
            const newValue = clamp(Math.floor(256 * normal), 0, 255);
            return new Color(newValue, newValue, newValue, 1);
        };
        this.perlinPixelGrid.applyFilter(filter);
    };

    blurPerlinNoise(range: number=1) {
        this.applyFilterWithBuffer(({ x, y }: IPoint, getColor: (position: IPoint) => Color) => {
            let neighborSum = 0;
            let neighborCount = 0;
            for (let i = -range; i <= range; i++) {
                for (let j = -range; j <= range; j++) {
                    const neighbor = this.perlinPixelGrid.get({ x: x + i, y: y + j });
                    if (neighbor) {
                        neighborSum += neighbor.red;
                        neighborCount++;
                    }
                }
            }
            const neighborMean = Math.floor(neighborSum / neighborCount);
            return new Color(neighborMean, neighborMean, neighborMean, 1);
        });
    };

    applyFilter(filter: (position: IPoint, getColor: (position: IPoint) => Color) => Color) {
        this.perlinPixelGrid.applyFilter(filter);
    };

    applyFilterWithBuffer(filter: (position: IPoint, getColor: (position: IPoint) => Color) => Color) {
        this.perlinPixelGrid.applyFilterWithBuffer(filter);
    };

    renderToContext(context: CanvasRenderingContext2D, position: IPoint=Geometry.Point.Zero) {
        this.perlinPixelGrid.renderToContext(context, position);
    };

    draw(world: World, position: IPoint=Geometry.Point.Zero, scale: IPoint=Geometry.Point.One) {
        this.perlinPixelGrid.draw(world, position, scale);
    };
}