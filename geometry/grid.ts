import { IPoint } from './interfaces';
import { Point } from './point';
import { CompassDirection, PointByCompassDirection, CompassDirectionGroup, CompassDirectionsByGroup as CompassDirectionsByGroup } from './compass';
import { Stack } from '@engine-ts/tools/stack';

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

    //https://lodev.org/cgtutor/floodfill.html
    public static GetRegion<T>(grid: IGrid<T>, position: IPoint, getValue: (t: T) => any)
    {
        let oldValue = getValue(grid.get(position));
        let region = [];

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
            while(y1 >= 0 && getValue(grid.get({ y: y1, x: x })) === oldValue)
                y1--;
            y1++;
    
            spanAbove = false;
            spanBelow = false;
            while(y1 < grid.h && getValue(grid.get({ y: y1, x })) === oldValue)
            {
                const tile = grid.get({ y: y1, x });
                if(tile == null || region.includes(tile))
                    break;
                region.push(tile);
                if(!spanAbove && x > 0 && getValue(grid.get({ y: y1, x: x - 1 })) === oldValue)
                {
                    stack.push({ x: x - 1, y: y1 });
                    spanAbove = true;
                }
                else if(spanAbove && x > 0 && getValue(grid.get({ y: y1, x: x - 1 })) !== oldValue)
                {
                    spanAbove = false;
                }
                if(!spanBelow && x < grid.w - 1 && getValue(grid.get({ y: y1, x: x + 1 })) === oldValue)
                {
                    stack.push({ y: y1, x: x + 1 });
                    spanBelow = true;
                }
                else if(spanBelow && x < grid.w - 1 && getValue(grid.get({ y: y1, x: x + 1 })) !== oldValue)
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
            const row = [];
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

    public forEach(tileCall: (tile: T, position?: IPoint) => void): void {
        const position = new Point();
        for(let y = 0; y < this.h; y++)
        for(let x = 0; x < this.w; x++) {
            position.setToXY(x, y);
            const tile = this.get(position);
            if(tile !== null)
                tileCall(tile, position);
        }
    };

    public map<U>(valueGetter: (tile: T, position?: IPoint) => U): U[] {
        const results = [];
        const position = new Point();
        for(let y = 0; y < this.h; y++)
        for(let x = 0; x < this.w; x++) {
            position.setToXY(x, y);
            results.push(valueGetter(this.get(position), position));
        }
        return results;
    };
}