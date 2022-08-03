import { Expr } from "./Expr";
import Token from "./Token";

class Parser {
  constructor(tokens) {
    this.tokens = tokens;
    this.current = 0;
  }

  program(progName = null) {
    console.log(`stuck ${this.peek()}`);
    let expressions = [];
    console.log(`Begin program ${progName}`);
    while (
      !this.isAtEnd() &&

      !(this.peek(1).type === "COLON" &&
        this.peek(2).type === "IDENTIFIER" &&
        progName !== null &&
        this.peek(2).value === progName)) {
      console.log(`pushed expr into program ${progName} <- ${this.peek()}`);
      expressions.push(this.expression());
    };


    if (this.check("IDENTIFIER") && this.peek(1).type === "COLON") {
      this.match("IDENTIFIER");
      let progName = this.previous().lexeme;
      this.match("COLON");
      console.log("subprogram:", progName);
      let progExpr = this.program(progName);
      this.match("COLON");
      this.match("IDENTIFIER");
      expressions.push(progExpr);
    };

    console.log(`End program ${progName} `);
    let progExpr = new Expr.Program(progName, expressions);
    return progExpr;
  }

  expression() {
    let expr = this.unary();
    return expr;
  }

  unary() {
    if (this.match("BANG")) {
      console.log("Negated expression");
      let operator = this.previous();
      let right = this.unary();
      return new Expr.Unary(operator, right);
    } else {
      return this.primary();
    }
  }

  primary() {
    if (this.match("NULL")) return new Expr.Literal(null);
    if (this.match("NUMBER", "STRING")) return new Expr.Literal(this.previous().literal);
    if (this.match("IDENTIFIER")) return new Expr.Word(this.previous());
    throw `ERROR: ${this.tokens[this.current]} `;
  }

  match(...types) {
    // consumes a token if it's a given type
    for (let type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }
    return false;
  }
  check(type) {
    if (this.isAtEnd()) return false;
    return this.peek().type === type;
  }

  advance() {
    if (!this.isAtEnd()) this.current++;
    return this.previous();
  }
  isAtEnd() {
    return this.peek().type === "EOF";
  }
  peek(n = 0) {
    if (this.current + n >= this.tokens.length) return this.tokens[-1];
    return this.tokens[this.current + n];
  }
  previous() {
    return this.tokens[this.current - 1];
  }
}

export default Parser;;;;