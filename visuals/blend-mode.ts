import { enumToList } from "../core/utils";

  export enum BlendMode {
    Default = 'source-over',
    SourceOver = 'source-over',
    SourceIn = 'source-in',
    SourceOut = 'source-out',
    SourceAtop = 'source-atop',
    DestinationOver = 'destination-over',
    DestinationIn = 'destination-in',
    DestinationOut = 'destination-out',
    DestinationAtop = 'destination-atop',
    Add = 'lighter',
    Lighter = 'lighter',
    Copy = 'copy',
    Xor = 'xor',
    Multiply = 'multiply',
    Screen = 'screen',
    Overlay = 'overlay',
    Darken = 'darken',
    Lighten = 'lighten',
    ColorDodge = 'color-dodge',
    ColorBurn = 'color-burn',
    HardLight = 'hard-light',
    SoftLight = 'soft-light',
    Difference = 'difference',
    Exclusion = 'exclusion',
    Hue = 'hue',
    Saturation = 'saturation',
    Color = 'color',
    Luminosity = 'luminosity'
};
export const BlendModes = enumToList(BlendMode);