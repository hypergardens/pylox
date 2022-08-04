import { Expr } from "./Expr";
import Token from "./Token";

class SRPasser {
  constructor(vm) {
    this.vm = vm;
    this.current = 0;
    this.tokens = [];
    this.programs = {};
  }

  pass(tokens) {
    this.tokens = tokens;
    let exprs = [];
    try {
      while (!this.isAtEnd()) {
        // ((WHITESPACE | COMMENT | NEWLINE)* primary)* EOF
        this.advance();
      }
      return this.tokens;
    } catch (error) {
      return null;
    }
  }

  pass() {
    for (let i = 0; i < this.tokens; i++) {
      if (this.match("LABEL")) {
        // abc: abc;
        console.log(`SRP: matched label ${this.previous().token}`);
      } else if (this.match("NUMBER", "STRING", "NULL", "WORD", "WHITESPACE", "COMMENT", "NEWLINE")) {
      } else {
        // ???
        let token = this.peek();
        this.error(token, `SR pass, unexpected token: ${this.tokens[this.current]} `);
        // this.advance();
      }
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

export default SRPasser;