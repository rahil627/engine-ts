export interface IPoolable {
    reset: (...args: any[]) => void,
}

export class Pool<T extends IPoolable> {
    private readonly poolables: Set<T> = new Set<T>();

    constructor(
        private readonly generate: () => T,
        private readonly capacity: number | null = null
    ) {}

    // adds a set number of objects to the pool (returns true if all were successfully added, false if only some were added due to capacity)
    warm(count: number): boolean {
        for(let i = 0; i < count; i++)
            if(!this.add())
                return false;
        return true;
    }

    // returns a resetted object from the pool (or a new object if there are none in the pool)
    get(...args: T extends { reset: (...args: infer U) => void } ? U : never): T {
        let poolable = this.poolables.values().next().value;
        if(poolable)
            this.poolables.delete(poolable);
        else
            poolable = this.generate();
        poolable.reset(...args);
        return poolable;
    }

    // adds an object to the pool, or adds a newly-generated object if no argument is given
    add(poolable?: T): boolean {
        if(this.isFull)
            return false;
        
        this.poolables.add(poolable ?? this.generate());
        return true;
    }

    // returns true if the pool is currently at capacity (returns false if there is no capacity limit)
    get isFull(): boolean { return this.capacity != null && this.poolables.size >= this.capacity; }
}

// // Test & Example Usage:
// 
// class Particle implements IPoolable {
//     constructor(private x: number, private y: number) {}
//     reset(x: number, y: number) {
//         this.x = x;
//         this.y = y;
//     }
// }
// 
// const pool = new Pool<Particle>(() => new Particle(0, 0), 5);
// const log = (obj: {}) => { console.warn(JSON.stringify(obj, undefined, 2)) }
// const logPool = (pool: Pool<any>) => { console.warn(JSON.stringify(Array.from(pool.poolables.values()), undefined, 2)); }
// 
// logPool(pool);
// log(pool.get(1, 2));
// log(pool.get(3, 4));
// logPool(pool);
// log(pool.warm(3));
// logPool(pool);
// log(pool.warm(3));
// logPool(pool);
// log(pool.get(1, 2));
// log(pool.get(3, 4));
// logPool(pool);
// log(pool.add(new Particle(5, 10)));
// logPool(pool);
// log(pool.get(1, 2));
// log(pool.get(1, 2));
// log(pool.get(1, 2));
// logPool(pool);
// log(pool.get(1, 2));
// logPool(pool);
// log(pool.get(1, 2));
// logPool(pool);