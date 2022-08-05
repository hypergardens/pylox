import Lexer from "./Lexer";
import Parser from "./Parser";
import Interpreter from "./Interpreter";

class Pylox {
  constructor() {
    this.hadError = false;
    this.lexer = new Lexer(this);
    this.parser = new Parser(this);
    this.interpreter = new Interpreter(this);
    this.stack = [];
    this.consoleText = [];
    this.hadError = false;
  }

  report(line, where, message) {
    let errMsg = `[Line ${line}] Error ${where}: ${message}`;
    console.error(errMsg);
    this.hadError = true;
    this.consoleText.push(errMsg);
  }

  error(token, message) {
    if (token.type === "EOF") {
      this.report(token.yOff, ` at end`, message);
    } else {
      this.report(token.yOff, ` at '${token.lexeme}'`, message);
    }
  }

  tokenise(source) {
    this.lexer = new Lexer(this);
    return this.lexer.scanTokens(source);
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
    console.log(`expressions`);
    console.log(expressions);
    return this.interpreter.interpret(expressions);
  }
}

export default Pylox;