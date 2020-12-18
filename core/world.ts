import { Entity } from './entity';
import { Camera } from './camera';
import { Mouse } from './mouse';
import { Color } from '../visuals/color';
import { Keyboard } from './keyboard';
import { Gamepads } from './gamepads';
import { Sounds } from './sounds';
import { Images } from './images';

export class World {
    public readonly canvas: HTMLCanvasElement;
    public readonly context: CanvasRenderingContext2D;

    public readonly images: Images;
    public readonly sounds: Sounds;
    public readonly camera: Camera;
    public readonly mouse: Mouse;
    public readonly keyboard: Keyboard;
    public readonly gamepads: Gamepads;

    public readonly entities: Entity[] = [];
    public readonly entityById: { [id: number]: Entity } = {};
    public readonly entitiesByClass: { [key: string]: Entity[] } = {};

    private readonly entityToAddById: { [id: number]: Entity } = {};
    private readonly entityToRemoveById: { [id: number]: Entity } = {};

    private nextEntityId: number = 0;

    public paused: boolean = false;
    public get millisecondsPerFrame(): number { return 1000 / this.fps; }
    public get millisecondsSinceStart(): number { return Date.now() - this.firstUpdateTimestamp; }
    private _isFirstFrame: boolean = true;
    public get isFirstFrame(): boolean { return this._isFirstFrame; }
    public firstUpdateTimestamp: number | null = null;
    public lastUpdateTimestamp: number = 0;
    public _delta: number = 0;
    public fixedFrameRate: boolean = true;
    public get delta(): number { return this.fixedFrameRate ? this.millisecondsPerFrame : this._delta; }
    public get deltaNormal(): number { return this.delta / this.millisecondsPerFrame; }
    public millisecondsLastUpdate: number = 0;

    public backgroundColor: Color | (() => Color) = Color.lightGrey;

    // create in ngOnInit and not in the component's constructor
    constructor(
        canvasId: string,
        canvasResolutionWidth: number = 1280,
        canvasResolutionHeight: number = 960,
        alpha: boolean=true,
        public readonly fps: number=60
    ) {
        console.log(`World started using canvas with id '${canvasId}'`);
        this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        if(this.canvas == null)
            throw `Canvas '${canvasId}' does not exist`;
        if(!this.canvas.getContext)
            throw `Cannot retrieve canvas context for '${canvasId}'`;
        this.context = this.canvas.getContext('2d', { alpha });
        this.canvas.oncontextmenu = () => false;

        this.setCanvasResolution(canvasResolutionWidth, canvasResolutionHeight);
        
        this.images = new Images();
        this.sounds = new Sounds();
        this.camera = new Camera(this.canvas);
        this.mouse = new Mouse(this.canvas, this.camera);
        this.keyboard = new Keyboard();
        this.gamepads = new Gamepads();

        this.mouse.start();
        this.keyboard.start();

        // default _delta to the value at the given fps
        this._delta = this.millisecondsPerFrame;
        setInterval(() => this.updateFrame(), this.millisecondsPerFrame);
    }

    public setCanvasSize(width: number, height: number) {
        this.canvas.style.width = `${width}px`;
        this.canvas.style.height = `${height}px`;
    }

    private setCanvasResolution(width: number, height: number) {
        this.canvas.width = width;
        this.canvas.height = height;
    }

    private updateFrame(): void {
        if(this.paused)
            return;
            
        const startMs = Date.now();
        
        this.updateDelta();
        this.updateEntities();
        this.clearCanvas(this.backgroundColor instanceof Color ? this.backgroundColor : this.backgroundColor());
        this.drawEntities();
        this.mouse.update();
        this.keyboard.update();
        this.gamepads.update();

        this._isFirstFrame = false;

        this.millisecondsLastUpdate = Date.now() - startMs;
    }

    private updateDelta(): void {
        if(this.firstUpdateTimestamp == null)
            this.firstUpdateTimestamp = Date.now();
        const now = Date.now();
        if(this.lastUpdateTimestamp != 0)
            this._delta = now - this.lastUpdateTimestamp;
        this.lastUpdateTimestamp = now;
    }

    private updateEntities(): void {
        for(const id in this.entityToAddById) {
            const entity = this.entityToAddById[id];
            delete this.entityToAddById[id];
            
            this.entities.push(entity);
            this.entityById[id] = entity;
            if(!(entity.class in this.entitiesByClass))
                this.entitiesByClass[entity.class] = [];
            this.entitiesByClass[entity.class].push(entity);
        }

        this.sortEntitiesByUpdateOrder();

        this.entities.forEach((o: Entity) => { if(o.active && !o.destroyed) o.update() });
        this.entities.forEach((o: Entity) => { if(o.active && !o.destroyed) o.postUpdate() });

        for(const id in this.entityToRemoveById) {
            const entity = this.entityToRemoveById[id];
            delete this.entityToRemoveById[id];

            entity.remove();
            this.entities.remove(entity);
            delete this.entityById[entity.id];
            this.entitiesByClass[entity.class].remove(entity);
            if(this.entitiesByClass[entity.class].length <= 0)
                delete this.entitiesByClass[entity.class];
            entity.removed = true;
        }
    }

    private drawEntities() {
        this.sortEntitiesByUpdateOrder();

        const entities = this.entities.filter(o => o.visible);
        entities.forEach((o: Entity) => o.draw());
    }

    // returns the id of the entity
    public addEntity(entity: Entity): number | null {
        if(entity.world != this)
            return null;
        const entityId = this.nextEntityId++;
        this.entityToAddById[entityId] = entity;
        return entityId;
    }

    public destroyEntity(entity: Entity) {
        if(entity.world != this || entity.destroyed)
            return;
        this.entityToRemoveById[entity.id] = entity;
        entity.destroyed = true;
    }

    public clearCanvas(color: Color | null=null) {
        if(color == null) {
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
            return;
        }
        this.context.fillStyle = color.toString();
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    private sortEntitiesByUpdateOrder() {
        this.entities.sort(this.compareUpdateOrders);
    }

    private compareUpdateOrders(a: Entity, b: Entity): number {
        return a.depth === b.depth
            ? a.id - b.id
            : b.depth - a.depth;
    };

    public entitiesOfClass<T extends Entity>(_class: string): T[] {
        return _class in this.entitiesByClass ? this.entitiesByClass[_class].map(e => e as T) : [];
    }

    public entityOfClass<T extends Entity>(_class: string): T | null {
        return _class in this.entitiesByClass ? this.entitiesByClass[_class].first() as T : null;
    }
}