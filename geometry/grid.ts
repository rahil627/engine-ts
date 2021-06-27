import { IPoint } from './interfaces';
import { Point } from './point';
import { CompassDirection, PointByCompassDirection, CompassDirectionGroup, CompassDirectionsByGroup as CompassDirectionsByGroup } from './compass';
import { Stack } from '@engine-ts/tools/stack';
import { IdSet } from '@engine-ts/tools/id-set';

export interface IGrid<T> {
    w: number;
    h: number;
    set: (position: IPoint, tile: T) => void;
    get: (position: IPoint) => T | null;
    getNeighbors: (position: IPoint, relativePoints: IPoint[]) => { position: IPoint, tile: T | null }[]
    getCompassDirectionNeighbors: (position: IPoint, compassDirections: CompassDirection[]) => { position: IPoint, tile: T | null }[]
    getCompassDirectionGroupNeighbors: (position: IPoint, directionalNeighbors: CompassDirectionGroup) => { position: IPoint, tile: T | null }[]
    isInside: (position: IPoint) => boolean;
    forEach: (tileCall: (tile: T, position?: IPoint) => void) => void;
    setEach: (tileGetter: (position: IPoint) => T) => void;
}

export class GridView<T> implements IGrid<T> {
    public readonly w: number;
    public readonly h: number;
    constructor(private readonly tiles: T[][]) {
        this.h = this.tiles.length;
        this.w = this.tiles.first()?.length ?? 0;
    }

    public isInside({ x, y }: IPoint): boolean {
        return y >= 0 && y < this.h && x >= 0 && x < this.w;
    }

    public set(position: IPoint, tile: T): void {
        if(this.isInside(position))
            this.tiles[position.y][position.x] = tile;
    }

    public get(position: IPoint): T | null {
        return this.isInside(position) ? this.tiles[position.y][position.x] : null;
    }

    public getNeighbors(position: IPoint, relativePoints: IPoint[]): { position: IPoint, tile: T | null }[] {
        return Grid.GetNeighbors(this, position, relativePoints);
    }

    public getCompassDirectionNeighbors(position: IPoint, compassDirections: CompassDirection[]): { position: IPoint, tile: T | null }[] {
        return Grid.GetCompassDirectionNeighbors(this, position, compassDirections);
    }

    public getCompassDirectionGroupNeighbors(position: IPoint, directionalNeighbors: CompassDirectionGroup=CompassDirectionGroup.CARDINAL): { position: IPoint, tile: T | null }[] {
        return Grid.GetCompassDirectionGroupNeighbors(this, position, directionalNeighbors);
    }

    public setEach(tileGetter: (position: IPoint) => T): void {
        const position = new Point();
        for(let y = 0; y < this.h; y++)
        for(let x = 0; x < this.w; x++) {
            position.setToXY(x, y);
            this.set(position, tileGetter(position));
        }
    };

    public forEach(tileCall: (tile: T, position: IPoint) => void): void {
        const position = new Point();
        for(let y = 0; y < this.h; y++)
        for(let x = 0; x < this.w; x++) {
            position.setToXY(x, y);
            const tile = this.get(position);
            if(tile !== null)
                tileCall(tile, position);
        }
    };
}

export class Grid<T> implements IGrid<T> {
    public static GetNeighbors<T>(grid: IGrid<T>, position: IPoint, relativePoints: IPoint[]): { position: IPoint, tile: T | null }[] {
        return relativePoints.map(o => {
            const positionTemp = { x: position.x + o.x, y: position.y + o.y };
            return { position: positionTemp, tile: grid.get(positionTemp) };
        });
    };

    public static GetCompassDirectionNeighbors<T>(grid: IGrid<T>, position: IPoint, compassDirections: CompassDirection[]): { position: IPoint, tile: T | null }[] {
        const compassDirectionPoints = compassDirections.map(direction => PointByCompassDirection[direction]);
        return Grid.GetNeighbors(grid, position, compassDirectionPoints);
    };

    public static GetCompassDirectionGroupNeighbors<T>(grid: IGrid<T>, position: IPoint, group: CompassDirectionGroup): { position: IPoint, tile: T | null }[] {
        const compassDirections = CompassDirectionsByGroup[group];
        return Grid.GetCompassDirectionNeighbors(grid, position, compassDirections);
    };

    // https://lodev.org/cgtutor/floodfill.html
    // TODO: use a single temp point instead of creating so many extra points
    public static GetRegion<T>(grid: IGrid<T>, position: IPoint, getValue: (t: T) => any): IdSet<{ x: number, y: number, tile: T }> {
        return this.GetRegionByPosition(grid, position, (x, y) => getValue(grid.get({ x, y })!));
    };
    
    public static GetRegionByPosition<T>(grid: IGrid<T>, position: IPoint, getValue: (x: number, y: number) => any): IdSet<{ x: number, y: number, tile: T }> {
        const result = new IdSet<{ x: number, y: number, tile: T }>((o: IPoint) => o.y * grid.h + o.x);
        for(let o of this.GetRegionGeneric(grid.w, grid.h, position, getValue)) {
            result.add({
                x: o.x,
                y: o.y,
                tile: grid.get(o)!
            });
        }
        return result;
    };
    
    public static GetRegionGeneric(w: number, h: number, position: IPoint, getValue: (x: number, y: number) => any): IdSet<IPoint> {
        let oldValue = getValue(position.x, position.y);
        let region = new IdSet((o: IPoint) => o.y * h + o.x);

        let y1 = 0;
        let spanAbove = false;
        let spanBelow = false;
    
        let stack = new Stack<IPoint>();
        stack.push(position);
        while(true)
        {
            const pt = stack.pop();
            if(pt == null)
                break;
            const { x, y } = pt;
    
            y1 = y;
            while(y1 >= 0 && getValue(x, y1) === oldValue)
                y1--;
            y1++;
    
            spanAbove = false;
            spanBelow = false;
            while(y1 < h && getValue(x, y1) === oldValue)
            {
                const obj = { x, y: y1 };
                if(region.has(obj))
                    break;
                region.add(obj);
                if(!spanAbove && x > 0 && getValue(x - 1, y1) === oldValue)
                {
                    stack.push({ x: x - 1, y: y1 });
                    spanAbove = true;
                }
                else if(spanAbove && x > 0 && getValue(x - 1, y1) !== oldValue)
                {
                    spanAbove = false;
                }
                if(!spanBelow && x < w - 1 && getValue(x + 1, y1) === oldValue)
                {
                    stack.push({ y: y1, x: x + 1 });
                    spanBelow = true;
                }
                else if(spanBelow && x < w - 1 && getValue(x + 1, y1) !== oldValue)
                {
                    spanBelow = false;
                }
                y1++;
            }
        }
        return region;
    };

    public readonly tiles: T[][];
    public readonly h: number;
    public readonly w: number;

    constructor(w: number, h: number, private tileGetter: (position: IPoint) => T) {
        this.h = Math.ceil(h);
        this.w = Math.ceil(w);

        const position = new Point();
        this.tiles = [];
        for(let y = 0; y < this.h; y++) {
            const row: T[] = [];
            for(let x = 0; x < this.w; x++) {
                row.push(this.tileGetter(position.setToXY(x, y)));
            }
            this.tiles.push(row);
        }
    }

    public reset(): void {
        const position = new Point();
        for(let y = 0; y < this.h; y++) {
            for(let x = 0; x < this.w; x++) {
                this.tiles[y][x] = this.tileGetter(position.setToXY(x, y));
            }
        }
    }

    public isInside({ x, y }: IPoint): boolean {
        return y >= 0 && y < this.h && x >= 0 && x < this.w;
    }

    public set(position: IPoint, tile: T): void {
        if(this.isInside(position))
            this.tiles[position.y][position.x] = tile;
    }

    public get(position: IPoint): T | null {
        return this.isInside(position) ? this.tiles[position.y][position.x] : null;
    }

    public getNeighbors(position: IPoint, relativePoints: IPoint[]): { position: IPoint, tile: T | null }[] {
        return Grid.GetNeighbors(this, position, relativePoints);
    }

    public getCompassDirectionNeighbors(position: IPoint, compassDirections: CompassDirection[]): { position: IPoint, tile: T | null }[] {
        return Grid.GetCompassDirectionNeighbors(this, position, compassDirections);
    }

    public getCompassDirectionGroupNeighbors(position: IPoint, directionalNeighbors: CompassDirectionGroup=CompassDirectionGroup.CARDINAL): { position: IPoint, tile: T | null }[] {
        return Grid.GetCompassDirectionGroupNeighbors(this, position, directionalNeighbors);
    }

    public setEach(tileGetter: (position: IPoint) => T): void {
        const position = new Point();
        for(let y = 0; y < this.h; y++)
        for(let x = 0; x < this.w; x++) {
            position.setToXY(x, y);
            this.set(position, tileGetter(position));
        }
    };

    public forEach(tileCall: (tile: T, position: IPoint) => void): void {
        const position = new Point();
        for(let y = 0; y < this.h; y++)
        for(let x = 0; x < this.w; x++) {
            position.setToXY(x, y);
            const tile = this.get(position);
            if(tile !== null)
                tileCall(tile, position);
        }
    };

    public map<U>(valueGetter: (tile: T, position: IPoint) => U): U[] {
        const results: U[] = [];
        const position = new Point();
        for(let y = 0; y < this.h; y++)
        for(let x = 0; x < this.w; x++) {
            position.setToXY(x, y);
            results.push(valueGetter(this.tiles[position.y][position.x], position));
        }
        return results;
    };
}