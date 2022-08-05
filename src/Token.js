
class Token {

  constructor(type, lexeme, literal, xOff, yOff) {
    this.type = type;
    let types = [`WORD`, `LABEL`, `STRING`, `NUMBER`, `NULL`, `WHITESPACE`, `NEWLINE`, `COMMENT`, `EOF`];
    if (types.indexOf(this.type) === -1) {
      throw `Unrecognised type: ${type}`;
    }
    this.lexeme = lexeme;
    this.literal = literal;
    if (xOff === undefined) throw `undefined pos ${lexeme}`;
    if (yOff === undefined) throw `undefined pos ${lexeme}`;
    this.xOff = xOff;
    this.yOff = yOff;
  }

  toString() {
    return `${this.type} ${this.lexeme} ${this.literal} at ${this.yOff}`;
  }
}

export default Token;