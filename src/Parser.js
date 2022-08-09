class Parser {
  constructor(vm) {
    this.vm = vm;
    this.current = 0;
    this.tokens = [];
    this.programs = [];
  }

  parse(tokens) {
    this.tokens = tokens;
    for (let token of tokens) {
      // console.log(token.toString());
      this.parseToken();
    }

    return tokens;
  }

  parseToken() {
    // set previously accumulated programs
    this.peek().setPrograms(this.programs);
    // console.log(`${this.peek().programs}-->${this.peek().lexeme}`);
    // console.log(this.peek());

    if (this.match(`WORD`, `STRING`, `NUMBER`, `NULL`,
      `WHITESPACE`, `NEWLINE`, `COMMENT`, `EOF`)) {
      return this.previous();
    } else if (this.match(`LABEL`)) {
      return this.handleLabel();
    } else {
      // ???
      let token = this.peek();
      this.error(token, `Parser: unexpected token: ${this.tokens[this.current]} `);
      // this.advance();
    }
  }

  handleLabel() {
    // abc: abc;
    // take previous token as label
    let token = this.previous();
    let lexeme = token.lexeme;

    if (lexeme[lexeme.length - 1] === `:`) {
      // abc:
      // add program to array
      let label = lexeme.slice(0, lexeme.length - 1);
      // console.log(`at token ${token} starting label ${label}`);

      // eat whitespace
      while (this.match("WHITESPACE")) { }


      // if followed by comment, nonlog
      if (this.peek().type === "COMMENT") {
        this.vm.silentPrograms[label] = true;
      }

      this.programs.push(label);
      // exec till label;
    } else if (lexeme[lexeme.length - 1] === `;`) {
      // remove program from array
      let label = lexeme.slice(0, lexeme.length - 1);
      // console.log(`at token ${token} ending label ${label}`);
      if (this.programs.indexOf(label) !== -1) {
        this.programs.splice(this.programs.indexOf(label), 1);
      } else {
        this.vm.error(token, "Label finished without beginning.");
      }
    } else {
      this.vm.error(token, "I don't know what's going on but this is where it is.");
    }
    return token;
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
    // TODO: hack?
    if (this.isAtEnd() && this.peek().type !== "EOF") return false;
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