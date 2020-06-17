// @ts-ignore
import CubeJs from 'cubejs';

const c: {[index: string]: string} = {
  'U': '#FFF', // White
  'R': '#891214', // Red
  'F': '#199B4C', // Green
  'D': '#FED52F', // yellow
  'B': '#0D48AC', // Blue
  'L': '#FF5525', // Orange
};

export interface Cubelet {
  x: number,
  y: number,
  z: number,
  num: number,
  type: string,
  colors?: string[]
}

let isInitSolver = false;
export class RubikCube {
  cubelets: Cubelet[] = [];
  cubeData: any;
  constructor(colorStr: string) {
    if (!colorStr) {
      colorStr = 'UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB';
    }
    this.generateCoords();
    this.generateColors(colorStr);

    this.cubeData = CubeJs.fromString(colorStr);
    (window as any).cube = this.cubeData;
  }
  move(notation: string) {
    return this.cubeData.move(notation);
  }

  asString() {
    return this.cubeData.asString();
  }

  generateCoords() {
    let num = 0;
    for (let y = 1; y >= -1; y--) {
      for (let z = -1; z <= 1; z++) {
        for (let x = -1; x <= 1; x++) {
          const n = [x, y, z].filter(Boolean).length;
          let type;
          if (n === 3) type = 'corner'; // Corner block
          if (n === 2) type = 'edge'; // Edge block
          if (n === 1) type = 'center'; // Center block

          this.cubelets.push({x, y, z, num, type});
          num++;
        }
      }
    }
  }

  generateColors(colorStr: string) {
    const colorNames = 'URFDLB'.split('');
    interface FaceColor {
      [index: string]: string;
    }
    const faceColor: FaceColor = {};
    for (let i = 0; i < colorNames.length; i++) {
      const name = colorNames[i];
      const start = i * 9;
      const end = start + 9;
      faceColor[name] = colorStr.slice(start, end);
    }

    for (const coord of this.cubelets) {
      const cubeColors: string[] = [c.U, c.U, c.U, c.U, c.U, c.U]; // [Right, Left, Up, Down, Front, Back]
      const {x, y, z, num} = coord;

      // Up
      if (y === 1) {
        const i = num;
        cubeColors[2]= c[faceColor['U'][i]];
      }

      // Down
      if (y === -1) {
        const n = num - 18;
        const i = Math.floor((8 - n) / 3) * 3 + (3 - (8 - n) % 3) - 1;
        cubeColors[3] = c[faceColor['D'][i]];
      }

      // Right
      if (x === 1) {
        const n = (num + 1) / 3 - 1;
        const i = Math.floor(n / 3) * 3 + (3 - n % 3) - 1;
        cubeColors[0] = c[faceColor['R'][i]];
      }

      // Left
      if (x === -1) {
        const i = num / 3;
        cubeColors[1] = c[faceColor['L'][i]];
      }

      // Front
      if (z === 1) {
        const i = Math.floor((num - 6) / 7) + ((num - 6) % 7);
        cubeColors[4] = c[faceColor['F'][i]];
      }

      // Back
      if (z === -1) {
        const n = Math.floor(num / 7) + (num % 7);
        const i = Math.floor(n / 3) * 3 + (3 - n % 3) - 1;
        cubeColors[5] = c[faceColor['B'][i]];
      }
      coord.colors = cubeColors;
    }
  }

  solve() {
    if (!isInitSolver) {
      CubeJs.initSolver();
      isInitSolver = true;
    }
    return this.cubeData.solve();
  }
}
