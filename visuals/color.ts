import { clamp, random } from '../core/utils';

export class Color {
    public static get random(): Color {
        return new Color(Math.floor(random() * 256), Math.floor(random() * 256), Math.floor(random() * 256));
    }

    private static _red: ConstColor;
    public static get red(): ConstColor { return Color._red; }
    private static _green: ConstColor;
    public static get green(): ConstColor { return Color._green; }
    private static _blue: ConstColor;
    public static get blue(): ConstColor { return Color._blue; }
    private static _cyan: ConstColor;
    public static get cyan(): ConstColor { return Color._cyan; }
    private static _yellow: ConstColor;
    public static get yellow(): ConstColor { return Color._yellow; }
    private static _magenta: ConstColor;
    public static get magenta(): ConstColor { return Color._magenta; }
    private static _orange: ConstColor;
    public static get orange(): ConstColor { return Color._orange; }
    private static _brown: ConstColor;
    public static get brown(): ConstColor { return Color._brown; }
    private static _lightBrown: ConstColor;
    public static get lightBrown(): ConstColor { return Color._lightBrown; }
    private static _black: ConstColor;
    public static get black(): ConstColor { return Color._black; }
    private static _lightGrey: ConstColor;
    public static get lightGrey(): ConstColor { return Color._lightGrey; }
    private static _grey: ConstColor;
    public static get grey(): ConstColor { return Color._grey; }
    private static _darkGrey: ConstColor;
    public static get darkGrey(): ConstColor { return Color._darkGrey; }
    private static _white: ConstColor;
    public static get white(): ConstColor { return Color._white; }
    private static _none: ConstColor;
    public static get none(): ConstColor { return Color._none; }

    public static start(): void {
        Color._red = new ConstColor(255, 0, 0);
        Color._green = new ConstColor(0, 255, 0);
        Color._blue = new ConstColor(0, 0, 255);
        Color._cyan = new ConstColor(0, 255, 255);
        Color._yellow = new ConstColor(255, 255, 0);
        Color._orange = new ConstColor(255, 128, 0);
        Color._brown = new ConstColor(40, 26, 13);
        Color._lightBrown = new ConstColor(153, 102, 51);
        Color._magenta = new ConstColor(255, 0, 255);
        Color._black = new ConstColor(0, 0, 0);
        Color._lightGrey = new ConstColor(192, 192, 192);
        Color._grey = new ConstColor(128, 128, 128);
        Color._darkGrey = new ConstColor(64, 64, 64);
        Color._white = new ConstColor(255, 255, 255);
        Color._none = new ConstColor(0, 0, 0, 0);
    }

    public get red(): number { return this._red; }
    public get green(): number { return this._green; }
    public get blue(): number { return this._blue; }
    public get alpha(): number { return this._alpha; }

    public set red(value: number) { this._red = clamp(value, 0, 255); }
    public set green(value: number) { this._green = clamp(value, 0, 255); }
    public set blue(value: number) { this._blue = clamp(value, 0, 255); }
    public set alpha(value: number) { this._alpha = clamp(value, 0, 1); }

    constructor(protected _red: number, protected _green: number, protected _blue: number, protected _alpha: number=1) {
        // Duplicated logic of 'set' functions above instead of just assigning using the setters because this way ConstColor won't throw errors
        this._red = clamp(_red, 0, 255);
        this._green = clamp(_green, 0, 255);
        this._blue = clamp(_blue, 0, 255);
        this._alpha = clamp(_alpha, 0, 1);
    }

    public clone(alpha: number | null=null): Color {
        return new Color(this.red, this.green, this.blue, alpha != null ? alpha : this.alpha);
    }

    public toString(): string {
        return `rgba(${this.red},${this.green},${this.blue},${this.alpha})`;
    }

    public lerp(other: Color, amount: number): Color {
        if(amount <= 0) return this.clone();
        if(amount >= 1) return other.clone();
        return new Color(
            (other.red - this.red) * amount + this.red,
            (other.green - this.green) * amount + this.green,
            (other.blue - this.blue) * amount + this.blue,
            (other.alpha - this.alpha) * amount + this.alpha
        );
    }

    public inverted(): Color {
        return new Color(255 - this.red, 255 - this.green, 255 - this.blue, this.alpha);
    }

    public isEqualTo(color:Color): boolean {
        return this.red === color.red
            && this.green === color.green
            && this.blue === color.blue
            && this.alpha === color.alpha;
    }
}

class ConstColor extends Color {
    public get red(): number { return this._red; }
    public get green(): number { return this._green; }
    public get blue(): number { return this._blue; }
    public get alpha(): number { return this._alpha; }

    public set red(value: number) { throw 'Cannot set \'red\' property of a ConstColor'; }
    public set green(value: number) { throw 'Cannot set \'green\' property of a ConstColor'; }
    public set blue(value: number) { throw 'Cannot set \'blue\' property of a ConstColor'; }
    public set alpha(value: number) { throw 'Cannot set \'alpha\' property of a ConstColor'; }
}

Color.start();