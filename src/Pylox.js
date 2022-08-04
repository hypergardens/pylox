import { Expr } from "./Expr";
import Token from "./Token";
import Scanner from "./Scanner";
import Parser from "./Parser";
import Interpreter from "./Interpreter";

class Pylox {
  constructor() {
    this.hadError = false;
    this.scanner = new Scanner(this);
    this.parser = new Parser(this);
    this.interpreter = new Interpreter(this);
    this.stack = [];
  }

  report(line, where, message) {
    console.error(`[Line ${line}] Error ${where}: ${message}`);
    this.hadError = true;
  }

  error(token, message) {
    if (token.type === "EOF") {
      this.report(token.line, ` at end`, message);
    } else {
      this.report(token.line, ` at '${token.lexeme}'`, message);
    }
  }

  tokenise(source) {
    this.scanner = new Scanner(this);
    return this.scanner.scanTokens(source);
  }

  parse(source) {
    // TODO: figure out if a separate scanner refresh is necessary
    this.parser = new Parser(this);
    let tokens = this.tokenise(source);
    return this.parser.parse(tokens);
  }

  interpret(source) {
    // TODO: figure out if a separate interpreter refresh is necessary
    this.interpreter = new Interpreter(this);
    let expressions = this.parse(source);
    return this.interpreter.interpret(expressions);
  }
}

export default Pylox;