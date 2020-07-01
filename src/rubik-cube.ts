const c: {[index: string]: string} = {
  'U': '#FEFEFE', // White
  'R': '#891214', // Red
  'F': '#199B4C', // Green
  'D': '#FED52F', // yellow
  'B': '#0D48AC', // Blue
  'L': '#FF5525', // Orange
};

const notationSwapTable: {
  [indexOf: string]: [number, number, number, number][];
} = {
  L: [[0, 18, 27, 53], [3, 21, 30, 50], [6, 24, 33, 47], [36, 38, 44, 42], [37, 41, 43, 39]],
  M: [[1, 19, 28, 52], [4, 22, 31, 49], [7, 25, 34, 46]],
  R: [[20, 2, 51, 29], [23, 5, 48, 32], [26, 8, 45, 35], [9, 11, 17, 15], [10, 14, 16, 12]],
  U: [[9, 18, 36, 45], [10, 19, 37, 46], [11, 20, 38, 47], [0, 2, 8, 6], [1, 5, 7, 3]],
  E: [[39, 21, 12, 48], [40, 22, 13, 49], [41, 23, 14, 50]],
  D: [[15, 51, 42, 24], [16, 52, 43, 25], [17, 53, 44, 26], [27, 29, 35, 33], [28, 32, 34, 30]],
  F: [[6, 9, 29, 44], [7, 12, 28, 41], [8, 15, 27, 38], [18, 20, 26, 24], [19, 23, 25, 21]],
  S: [[3, 10, 32, 43], [4, 13, 31, 40], [5, 16, 30, 37]],
  B: [[2, 36, 33, 17], [1, 39, 34, 14], [0, 42, 35, 11], [45, 47, 53, 51], [46, 50, 52, 48]],
};

export interface Cubelet {
  x: number,
  y: number,
  z: number,
  num: number,
  type: string,
  color?: {[index: string]: string},
}

export class RubikCube {
  cubelets: Cubelet[] = [];
  colors: string[];
  constructor(colorStr?: string) {
    if (!colorStr) {
      colorStr = 'UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB';
    }
    this.colors = colorStr.trim().split('');

    this.generateCoords();
    this.generateColors();
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

  generateColors() {
    const colorNames = 'URFDLB'.split('');
    interface FaceColor {
      [index: string]: string[];
    }
    const faceColor: FaceColor = {};
    for (let i = 0; i < colorNames.length; i++) {
      const name = colorNames[i];
      const start = i * 9;
      const end = start + 9;
      faceColor[name] = this.colors.slice(start, end);
    }

    for (const cubelet of this.cubelets) {
      const cubeColor: {[index: string]: string} = {};
      const {x, y, z, num} = cubelet;

      // Up
      if (y === 1) {
        const i = num;
        cubeColor['U']= c[faceColor['U'][i]];
      }

      // Down
      if (y === -1) {
        const n = num - 18;
        const i = Math.floor((8 - n) / 3) * 3 + (3 - (8 - n) % 3) - 1;
        cubeColor['D'] = c[faceColor['D'][i]];
      }

      // Right
      if (x === 1) {
        const n = (num + 1) / 3 - 1;
        const i = Math.floor(n / 3) * 3 + (3 - n % 3) - 1;
        cubeColor['R'] = c[faceColor['R'][i]];
      }

      // Left
      if (x === -1) {
        const i = num / 3;
        cubeColor['L'] = c[faceColor['L'][i]];
      }

      // Front
      if (z === 1) {
        const i = Math.floor((num - 6) / 7) + ((num - 6) % 7);
        cubeColor['F'] = c[faceColor['F'][i]];
      }

      // Back
      if (z === -1) {
        const n = Math.floor(num / 7) + (num % 7);
        const i = Math.floor(n / 3) * 3 + (3 - n % 3) - 1;
        cubeColor['B'] = c[faceColor['B'][i]];
      }
      cubelet.color = cubeColor;
    }
  }

  asString() {
    return this.colors.join('');
  }

  move(notationStr: string) {
    const notations = notationStr.trim().split(' ');
    for (const i of notations) {
      let toward = 1;
      let rotationTimes = 1;
      const notation = i[0];
      const secondNota = i[1];
      if (secondNota) {
        if (secondNota === `'`) {
          toward = -1;
        } else if (secondNota === `2`) {
          rotationTimes = 2;
        } else {
          throw new Error(`Wrong secondNota: ${secondNota}`);
        }
      }

      for (let j = 0; j < rotationTimes; j++) {
        const actions = notationSwapTable[notation];
        for (const k of actions) {
          this.swapFaceColor(k, toward);
        }
      }
    }
  }

  swapFaceColor(faceColorNums: number[], toward: number) {
    const [a, b, c, d] = faceColorNums;
    const colors = this.colors;
    const aColor = colors[a];
    if (toward === -1) {
      colors[a] = colors[b];
      colors[b] = colors[c];
      colors[c] = colors[d];
      colors[d] = aColor;
    } else if (toward === 1) {
      colors[a] = colors[d];
      colors[d] = colors[c];
      colors[c] = colors[b];
      colors[b] = aColor;
    } else {
      throw new Error(`Wrong toward: ${toward}`);
    }
  }
}
