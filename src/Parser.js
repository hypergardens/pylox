import { Expr } from "./Expr";
import Token from "./Token";

class Parser {
  constructor(vm) {
    this.vm = vm;
    this.current = 0;
    this.tokens = [];
  }

  parse(tokens) {
    this.tokens = tokens;
    let exprs = [];
    try {
      while (!this.isAtEnd()) {
        while (this.match("WHITESPACE", "COMMENT", "NEWLINE")) {
        }
        if (!this.isAtEnd())
          exprs.push(this.primary());
      }
      return exprs;
    } catch (error) {
      return null;
    }
  }

  // unary() {
  // TODO: negated expressions, lex correctly first
  // if (this.match("BANG")) {
  //   console.log("Negated expression");
  //   let operator = this.previous();
  //   let right = this.unary();
  //   return new Expr.Unary(operator, right);
  // } else {
  // return this.primary();
  // }
  // }

  primary() {
    // if (this.match("SEMICOLON")) return new Expr.Literal(";");
    // if (this.match("COLON")) return new Expr.Literal(":");

    if (this.match("NULL")) {
      return new Expr.Literal(null);
    } else if (this.match("NUMBER", "STRING")) {
      return new Expr.Literal(this.previous().literal);
    } else if (this.match("WORD")) {
      return new Expr.Word(this.previous());
    } else {
      let token = this.tokens[this.current];
      this.error(token, `Unexpected token: ${this.tokens[this.current]} `);
      // this.advance();
    }
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
    // TODO: implement with catch?
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
    let token;
    if (this.current + n > this.tokens.length) {
      token = this.tokens[this.tokens.length - 1];
    } else {
      token = this.tokens[this.current + n];
    }
    return token;
  }

  previous() {
    return this.tokens[this.current - 1];
  }

  error(token, message) {
    this.vm.error(token, message);
    return { token, message };
  }

  synchronise() {
    this.advance();

    while (!this.isAtEnd()) {
      if (this.previous().type === "WHITESPACE") {
        return;
      }
    }
  }
}

export default Parser;;;;