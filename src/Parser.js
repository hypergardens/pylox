import { Expr } from "./Expr";
import Token from "./Token";

class Parser {
  constructor(tokens) {
    this.tokens = tokens;
    this.current = 0;
  }

  expressions(progName = null) {
    let exprs = [];
    while (!this.isAtEnd() &&
      !(progName !== null &&
        this.check("IDENTIFIER") &&
        this.peek(1).type === "SEMICOLON")) {
      exprs.push(this.expression());
    }
    return exprs;
  }

  expression(progName = null) {
    let expr;
    if (this.check("IDENTIFIER") && this.peek(1).type === "COLON") {
      // start subprogram
      this.match("IDENTIFIER");
      let progName = this.previous().lexeme;
      this.match("COLON");

      console.log("subprogram:", progName);
      // let progExpr = this.program(progName);
      let exprs = this.expressions(progName);
      // if (progName !== null && !(this.check("IDENTIFIER") && this.peek(1).type === "SEMICOLON")) {
      // console.error();
      // } else {
      this.consume("IDENTIFIER", `Unfinished program ${progName}`);
      this.consume("SEMICOLON", `Unfinished program ${progName}`);
      expr = new Expr.Program(progName, exprs);
      // }
      // end subprogram
    } else {
      // unary expression, not subprogram
      expr = this.unary();
    };
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

  consume(type, message) {
    if (this.check(type)) return this.advance();
    throw { token: this.peek(), message };
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