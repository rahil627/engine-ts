import { clamp } from '../core/utils';

export class Healthbar {
    public get isDead(): boolean { return this.health <= 0; }

    public get normal(): number { return clamp(this.health / this.healthMax, 0, 1); }
    public set normal(_normal: number) {
        this._health = this._healthMax * _normal;
        this.capHealth();
    }

    public get health(): number { return this._health; }
    public set health(_health: number) {
        this._health = _health;
        this.capHealth();
    }
    
    public get healthMax(): number { return this._healthMax; }
    public set healthMax(_healthMax: number) {
        this._healthMax = _healthMax;
        this.capHealth();
    }

    constructor(private _healthMax: number, private _health: number=_healthMax) {
        this.capHealth();
    }

    public hit(damage: number) {
        this._health -= damage;
        this.capHealth();
    }

    public heal(health: number) {
        this._health += health;
        this.capHealth();
    }

    public fullHeal() {
        this._health = this.healthMax;
    }

    private capHealth() {
        this._health = clamp(this._health, 0, this.healthMax);
    }
}