// Tipos del archivo vendorizado qrcode-generator-2.0.4.js (adaptados de dist/qrcode.d.ts del paquete, MIT, © 2016 Kazuhiko Arase),
// solo con lo que usa la interfaz. El archivo .js es dist/qrcode.mjs sin cambios (ver LICENCIA-qrcode-generator.txt).
export type NumeroDeTipo = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 |
  25 | 26 | 27 | 28 | 29 | 30 | 31 | 32 | 33 | 34 | 35 | 36 | 37 | 38 | 39 | 40;
export type NivelCorreccion = 'L' | 'M' | 'Q' | 'H';
export interface CodigoQR {
  addData(data: string, mode?: 'Numeric' | 'Alphanumeric' | 'Byte' | 'Kanji'): void;
  make(): void;
  getModuleCount(): number;
  isDark(fila: number, columna: number): boolean;
}
export interface FabricaQR {
  (tipo: NumeroDeTipo, correccion: NivelCorreccion): CodigoQR;
  stringToBytes(s: string): number[];
  stringToBytesFuncs: { [codificacion: string]: (s: string) => number[] };
}
export declare const qrcode: FabricaQR;
export default qrcode;
