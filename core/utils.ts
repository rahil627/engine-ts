export function log(text: string, level = "info") {
    let d = new Date();
    let dateString = d.getFullYear() + "-" + ("0"+(d.getMonth()+1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2) + " " + ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2) + ":" + ("0" + d.getSeconds()).slice(-2) + "." + ("00" + d.getMilliseconds()).slice(-3) + " UTC" + (d.getTimezoneOffset() > 0 ? "-" : "+") + Math.abs(d.getTimezoneOffset() / 60);
    const textFinal = `[${level}][${dateString}] ${text}`;
    switch(level) {
        case 'error':
            console.error(textFinal);
            break;
        case 'warn':
            console.warn(textFinal);
            break;
        default:
            console.log(textFinal);
            break;
    }
};

export enum Halign {
    LEFT = 'left',
    CENTER = 'center',
    RIGHT = 'right'
}

export enum Valign {
    TOP = 'top',
    MIDDLE = 'middle',
    BOTTOM = 'bottom'
}

export function clamp(value: number, min: number, max: number) {
    return value <= min
        ? min
        : value >= max
            ? max
            : value;
}

export function millisecondsToExecute(call: () => any): number {
    const start = Date.now();
    call();
    const end = Date.now();
    return end - start;
}

export async function sleep(milliseconds: number) {
    await new Promise(resolve => setTimeout(resolve, milliseconds));
}

export const tau: number = Math.PI * 2;

// TODO: remove in favor of Geometry.distanceSq/distance
export function distanceSq(x0: number, y0: number, x1: number, y1: number): number {
    return (x0 - x1) * (x0 - x1) + (y0 - y1) * (y0 - y1);
}
export function distance(x0: number, y0: number, x1: number, y1: number): number {
    return Math.sqrt(distanceSq(x0, y0, x1, y1));
}

export function binomialCoefficient(n: number, k: number) {
    let result = 1;
    for(let i = n - k + 1; i <= n; i++)
        result *= i;
    for(let i = 1; i <= k; i++)
        result /= i;
    return result;
}


// calculates "value % modulo" but wraps negative numbers so the result is always in the range [0, module)
//
// -270 % 360 = -270
// moduloSafe(-270, 360) = 90
// 
// -540 % 360 = -180
// moduloSafe(-540, 360) = 180
export function moduloSafe(value: number, modulo: number) { return ((value % modulo) + modulo) % modulo; }

export function angleDifference(from: number, to: number) { return moduloSafe(to - from - Math.PI, tau) - Math.PI; };

// https://stackoverflow.com/a/55365334
export function getGuidPart(): string {
    return (((1 + random()) * 0x10000) | 0).toString(16).substring(1);
}
export function getGuid(): string {
    return `${getGuidPart()}${getGuidPart()}-${getGuidPart()}-${getGuidPart()}-${getGuidPart()}-${getGuidPart()}${getGuidPart()}${getGuidPart()}`;
}

export function getRandomNumberGenerator(seed: number): () => number {
    return () => { 
        seed = Math.sin(seed) * 10000;
        return seed - Math.floor(seed);
    };
}

export const randomSeed = Math.random();
console.log(`Random seed: ${randomSeed}`);
export const random = getRandomNumberGenerator(randomSeed);

// inclusive of -0.5, exclusive of positive 0.5
export const randomSign = (): number => Math.sign(random() - 0.5);

// inclusive of lower bound, exclusive of upper bound
export const randomRange = (min: number, max: number): number => random() * (max - min) + min

declare global {
    interface Array<T> {
        swap(firstIndex: number, secondIndex: number): void;
        remove(item: T): number | null;
        removeAt(index: number): T;
        removeAtMultiple(...indices: number[]): T[];
        removeWhere(valueGetter: (o: T, i?: number) => boolean): T[];
        reversed(): T[];
        sample(): T;
        samples(count: number): T[];
        shuffle(): T[];
        shuffled(): T[];
        flattened(): T;
        any(boolCheck: (o: T) => boolean): boolean;
        all(boolCheck: (o: T) => boolean): boolean;
        first(boolCheck?: ((o: T) => boolean) | null): T | null;
        last(boolCheck?: ((o: T) => boolean) | null): T | null;
        bestOf(boolCheck: (o: T) => boolean): T | null;
        minOf(valueGetter: (o: T) => number): T | null;
        maxOf(valueGetter: (o: T) => number): T | null;
        sumOf(valueGetter: (o: T) => number): number | null;
        batchify(batchSize: number): T[][];
        mappedBy(keyGetter: (o: T) => string): { [key: string]: T[] };
        mappedByUnique(keyGetter: (o: T) => string): { [key: string]: T };
        copy(other: T[]): void;
        clone(): T[];
        clear(): void;
        sorted(compare?: (a: T, b: T) => number): T[];
        orderBy(getter: (a: T) => number): T[];
        distinct(valueGetter?: (o: T) => string | number): T[];
        distincted(valueGetter?: (o: T) => string | number): T[];

        // number only
        min(this: Array<number>): number | null;
        max(this: Array<number>): number | null;
        sum(this: Array<number>): number | null;
    }
}

Array.prototype.swap = function(firstIndex: number, secondIndex: number): void
{
    this[firstIndex] = this.splice(secondIndex, 1, this[firstIndex])[0];
};

Array.prototype.remove = function<T>(item: T): number | null
{
    const index = this.indexOf(item);
    if(index == -1)
        return null;
    this.removeAt(index);
    return index;
};

Array.prototype.removeAt = function<T>(index: number): T | null
{
    if(index < 0 || index >= this.length)
        return null;
    const item = this[index];
    this.splice(index, 1);
    return item;
};

// returns the elements at the current indices after they've been removed from the array
// (items return in the reverse order they were in the array;
//  call .reversed() on the return value to flip it if necessary)
Array.prototype.removeAtMultiple = function<T>(...indices: number[]): T[]
{
    return indices
        .sorted((a, b) => b - a)
        .map((index: number) => this.removeAt(index));
};

Array.prototype.removeWhere = function<T>(valueGetter: (o: T, i?: number) => boolean): T[]
{
    const indicesToRemove = this.reduce((list: number[], obj: T, index: number) => {
        if(valueGetter(obj, index))
            list.push(index);
        return list;
    }, []).reversed();
    return indicesToRemove.map((index: number) => {
        const item = this[index];
        this.splice(index, 1);
        return item;
    });
}

//Returns a new array that is a reverse of the given array
Array.prototype.reversed = function<T>(): T[]
{
    const list = this.clone();
    list.reverse();
    return list;
};

//Returns a random element of the array
Array.prototype.sample = function<T>(): T | null
{
    return this.length > 0
        ? this[Math.floor(random() * this.length)]
        : null;
};

//Returns random (different) elements of the array.
//Fastest when you're going to end up selecting most of the array.
Array.prototype.samples = function<T>(count: number): T[]
{
    if(count <= 0 || this.length <= 0)
        return [];
    const tempList = this.clone();
    while(tempList.length > count)
        tempList.removeAt(Math.floor(random() * tempList.length));
    return tempList;
};

// Fisher-Yates shuffle
// https://bost.ocks.org/mike/shuffle/
Array.prototype.shuffle = function<T>(): T[]
{
    let j = this.length;
    let i = 0;
    while (j > 0) {
      i = Math.floor(random() * j);
      j--;
      this.swap(i, j);
    }  
    return this;
}

//Returns a new array that is a shuffled version of the given array
Array.prototype.shuffled = function<T>(): T[]
{
    const list = this.clone();
    list.shuffle();
    return list;
}

Array.prototype.flattened = function<T>(): T
{
    return [].concat.apply([], this);
};

Array.prototype.any = function<T>(boolCheck: (o: T) => boolean): boolean
{
    return this.some(boolCheck);
};

Array.prototype.all = function<T>(boolCheck: (o: T) => boolean): boolean
{
    return !this.some((o: T) => !boolCheck(o));
};

Array.prototype.first = function<T>(boolCheck: ((o: T) => boolean) | null=null): T | null
{
    if(boolCheck === null)
    {
        return this.length <= 0
            ? null
            : this[0];
    }

    for(let element of this)
        if (boolCheck(element))
            return element;
    return null;
};

Array.prototype.last = function<T>(boolCheck: ((o: T) => boolean) | null=null): T | null
{
    if(boolCheck === null)
    {
        return this.length <= 0
            ? null
            : this[this.length-1];
    }

    for(let i = this.length-1; i >= 0; i--)
    {
        const element = this[i];
        if (boolCheck(element))
            return element;
    }
    return null;
};

// AisBetterThanB = a function which takes two parameters and returns true if the first one is "better" than the second one, false otherwise.
// Returns the single element that won every comparison it was involved in (or null if the list is empty).
//
// Examples:
//
// Problem: I need the object with the highest score, or the first match if there's a tie
// [{score:5}, {id:'a', score:6}, {id:'b', score:6}, {score:3}]
//  .bestOf((a, b) => a.score > b.score)
//      = {id:'a', score:6}
// Note: alternative formulation = [{score:5}, {score:6}, {score:3}].maxOf(o => o.score)
//
// Problem: I need the object with the highest score, or the last match if there's a tie
// [{score:5}, {id:'a', score:6}, {id:'b', score:6}, {score:3}]
//  .bestOf((a, b) => a.score >= b.score)
//      = {id:'b', score:6}
//
// Problem: I need the character with the longest name who is still alive
// [
//     {name:'harry', alive:true},
//     {name:'ron', alive:true},
//     {name:'hermione', alive:true},
//     {name:'voldemort', alive:false}
// ].bestOf((a, b) => a.alive && a.name.length > b.name.length)
//     = {name:'hermione', alive:true}
//
// Problem: I need the object that is facing most upward
// [{direction: new Point(2, 6)}, {direction: new Point(-4, -3)}]
//  .bestOf((a, b) => a.direction.towardness(Point.up) > b.direction.towardness(Point.up))
//      = {direction: new Point(-4, -3)}
//
Array.prototype.bestOf = function<T>(AisBetterThanB: (a: T, b: T) => boolean): T | null
{
    if(this.length === 0)
        return null;

    let bestItem = this[0];
    for(let item of this)
        if(AisBetterThanB(item, bestItem))
            bestItem = item;
    return bestItem;
};

// Returns the element of the array with the lowest valueGetter(element) value
// Note: the first match is returned if there is a tie
Array.prototype.minOf = function<T>(valueGetter: (o: T) => number): T | null
{
    return this.length > 0
        ? this.bestOf((a: T, b: T) => valueGetter(a) < valueGetter(b))
        : null;
};

// Returns the element of the array with the highest valueGetter(element) value
// Note: the first match is returned if there is a tie
Array.prototype.maxOf = function<T>(valueGetter: (o: T) => number): T | null
{
    return this.length > 0
        ? this.bestOf((a: T, b: T) => valueGetter(a) > valueGetter(b))
        : null;
};

Array.prototype.sumOf = function<T>(valueGetter: (o: T) => number): number | null
{
    return this.length > 0
        ? this.reduce((total: number, element: T) => total + valueGetter(element), 0)
        : null;
};

Array.prototype.min = function(): number | null { return this.length > 0 ? this.minOf((o: number) => o) : null; }
Array.prototype.max = function(): number | null { return this.length > 0 ? this.maxOf((o: number) => o) : null; }
Array.prototype.sum = function(): number | null {
    return this.length > 0
        ? this.reduce((total, increment) => total + increment)
        : null;
};

// Opposite of flattening an array; takes a one-dimensional array and cuts it into count-sized chunks, returning an array of arrays
Array.prototype.batchify = function<T>(batchSize: number): T[][]
{
    return this.reduce((batchList: Array<Array<T>>, item: T) => {
        const last = batchList.last();
        if(last && last.length >= batchSize)
            batchList.push(new Array<T>(batchSize));
        batchList.last().push(item);
        return batchList;
    }, [[]]);
};

// Example:
// [
//      {name:'squirtle 1', type:'water'},
//      {name:'bulbasaur 1', type:'grass'},
//      {name:'bulbasaur 2', type:'grass'},
//      {name:'charmander', type:'fire'},
//      {name:'squirtle 2', type:'water'}
// ]
// .mappedBy(o => o.name)
//
// {
//      squirtle: [{name:'squirtle 1', type:'water'},{name:'squirtle 2', type:'water'}],
//      bulbasaur: [{name:'bulbasaur 1', type:'grass'},{name:'bulbasaur 2', type:'grass'}],
//      charmander: [{name:'charmander', type:'fire'}]
// }
Array.prototype.mappedBy = function<T>(keyGetter: (o: T) => string): { [key: string]: T[] } {
    return this.reduce((obj: { [key: string]: T[] }, element: T) => {
        const key = keyGetter(element);
        if(!(key in obj))
            obj[key] = [];
        obj[key].push(element);
        return obj
    },
    {});
};

// Same as Array.mappedBy except only the last element at each key is returned
// Best for circumstances where you're expecting the key value to be unique
Array.prototype.mappedByUnique = function<T>(keyGetter: (o: T) => string): { [key: string]: T } {
    return this.reduce((obj: { [key: string]: T }, element: T) => {
        const key = keyGetter(element);
        obj[key] = element;
        return obj
    },
    {});
};

Array.prototype.copy = function<T>(other: T[])
{
    this.splice(0, this.length, ...other);
}

Array.prototype.clone = function<T>(): T[]
{
    return this.slice(0);
};

Array.prototype.clear = function<T>(): void
{
    this.length = 0;
};

// Chainable sort (modifies existing array)
Array.prototype.sorted = function<T>(compare?: (a: T, b: T) => number): T[]
{
    this.sort(compare);
    return this;
};

Array.prototype.orderBy = function<T>(getter: (a: T) => number): T[]
{
    this.sort((a: T, b: T) => getter(a) - getter(b));
    return this;
}

// Returns the existing list but after removing all elements whose values are not unique as determined by the mapping function "valueGetter"
// (the first element with a given value is kept)
// Example:
// [
//     {id:0,n:1},
//     {id:1,n:2},
//     {id:2,n:1},
//     {id:3,n:3},
//     {id:4,n:2}
// ]
// .distinct(o => o.n) =
// [
//     {id:0,n:1},
//     {id:1,n:2},
//     {id:3,n:3}
// ]
Array.prototype.distinct = function<T>(valueGetter?: (o: T) => string | number): T[]
{
    const values = this.map((o: T) => valueGetter ? valueGetter(o) : o);
    this.removeWhere((o: T, i: number) => values.indexOf(valueGetter ? valueGetter(o) : o) !== i);
    return this;
};

// Returns a new list that has had .distinct() called
Array.prototype.distincted = function<T>(valueGetter?: (o: T) => string | number): T[]
{
    const values = valueGetter ? this.map((o: T) => valueGetter(o)) : this;
    return this.filter((o: T, i: number) => values.indexOf(valueGetter ? valueGetter(o) : o) === i);
};
