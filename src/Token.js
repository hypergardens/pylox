
class Token {

  constructor(type, lexeme, literal, line, xOff, yOff) {
    this.type = type;
    this.lexeme = lexeme;
    this.literal = literal;
    this.line = line;
    if (xOff === undefined) throw `undefined pos ${lexeme}`;
    if (yOff === undefined) throw `undefined pos ${lexeme}`;
    this.xOff = xOff;
    this.yOff = yOff;
  }

  toString() {
    return `${this.type} ${this.lexeme} ${this.literal} at ${this.line}`;
  }
}

export default Token;