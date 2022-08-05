import { TokenTypes } from "./TokenTypes";
class Token {

  constructor(type, lexeme, literal, xOff, yOff) {
    this.type = type;

    // check known type of token
    if (TokenTypes.types.indexOf(this.type) === -1) {
      throw `Unrecognised type: ${type}`;
    }

    // actual string for the token
    this.lexeme = lexeme;
    // only for NUMBER and STRING
    this.literal = literal;

    if (xOff === undefined) throw `undefined pos ${lexeme}`;
    if (yOff === undefined) throw `undefined pos ${lexeme}`;
    this.xOff = xOff;
    this.yOff = yOff;

    this.programs = [];
  }

  setPrograms(programs) {
    this.programs = [];
    for (let program of programs) {
      this.programs.push(program);
    }
  }

  accept(visitor) {
    visitor[`visit${this.type}token`](this);
    // switch (this.type) {
    //   case "WORD":
    //     visitor.visitWordToken(this);
    //     break;
    //   case "LABEL":
    //     visitor.visitWordToken(this);
    //     break;
    //   case "STRING":
    //     visitor.visitWordToken(this);
    //     break;
    //   case "NUMBER":
    //     visitor.visitWordToken(this);
    //     break;
    //   case "NULL":
    //     visitor.visitWordToken(this);
    //     break;
    //   case "WHITESPACE":
    //     visitor.visitWordToken(this);
    //     break;
    //   case "NEWLINE":
    //     visitor.visitWordToken(this);
    //     break;
    //   case "COMMENT":
    //     visitor.visitWordToken(this);
    //     break;
    //   case "EOF":
    //     visitor.visitWordToken(this);
    //     break;
    // }
  }
  toString() {
    return `${this.type} ${this.lexeme} ${this.literal} at ${this.yOff}`;
  }
}

export default Token;