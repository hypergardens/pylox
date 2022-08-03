
class Scanner {
  constructor(source, vm) {
    this.source = source;
    this.start = 0;
    this.current = 0;
    this.line = 1;
    this.tokens = [];
    this.vm = vm;
  }

  scanTokens() {
    while (!this.isAtEnd()) {
      this.start = this.current;
      this.scanToken();
    }
    this.tokens.push(new Token("EOF", "", null, this.line));
    return this.tokens;
  }

  scanToken() {
    let char = this.advance();
    switch (char) {
      case ".":
        this.addToken("DOT");
        break;
      case ",":
        this.addToken("COMMA");
        break;
      case "@":
        this.addToken("AT");
        break;

      case "/":
        if (this.match("/")) {
          while (this.peek() != '\n' && this.isAtEnd()) this.advance();
        } else {
          this.addToken("SLASH");
        }

      case "!":
        this.addToken(this.match("=") ? "BANG_EQUAL" : "BANG");

      // ignore whitespace
      case " ":
      case "\r":
      case "\t":
        break;

      case "\n":
        this.line++;
        break;

      case `"`:
        this.string();
        break;

      default:
        if (this.isDigit(char)) {
          this.number();
        } else if (this.isAlpha(char)) {
          this.identifier();
        } else {
          this.vm.error(this.line, `Unexpected character ${char}.`);
        }
        break;
    }
  }

  identifier() {
    while (this.isAlphaNumeric(this.peek())) this.advance();

    let map = {
      "if": "IF",
      "null": "NULL"
    };

    let text = this.source.slice(this.start, this.current);
    let type = map[text];
    if (type === undefined) type = "IDENTIFIER";
    this.addToken(type);
  }

  number() {
    // consume digits
    while (this.isDigit(this.peek())) this.advance();

    if (this.peek() == "." && this.isDigit(this.peekNext())) {
      // consume "."
      this.advance();

      // consume fractional part
      while (this.isDigit(this.peek())) this.advance();
    }
    this.addToken("NUMBER", Number(this.source.slice(this.start, this.current)));
  }

  string() {
    // TODO: unescape \" like characters
    // consume characters
    while (this.peek() != `"` && !this.isAtEnd()) {
      if (this.peek() == "\n") this.line++;
      this.advance();
    }

    if (this.isAtEnd()) {
      this.vm.error(this.line, "Unterminated string.");
    }

    // the closing "
    this.advance();
    let value = this.source.slice(this.start + 1, this.current - 1);
    this.addToken("STRING", value);
  }

  match(expected) {
    if (this.isAtEnd()) return false;
    if (this.source[this.current] != expected) return false;
    this.current++;
    return true;
  }

  peek() {
    if (this.isAtEnd()) return '\0';
    return this.source[this.current];
  }

  peekNext() {
    if (this.current + 1 >= this.source.length) return "\0";
    return this.source[this.current + 1];
  }

  isAlpha(char) {
    return "_abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".indexOf(char) !== -1;
  }

  isAlphaNumeric(char) {
    return this.isDigit(char) || this.isAlpha(char);
  }

  isDigit(char) {
    return "0123456789".indexOf(char) !== -1;
  }

  addToken(type, literal = null) {
    let text = this.source.slice(this.start, this.current);
    this.tokens.push(new Token(type, text, literal, this.line));
  }

  advance() {
    // return current char and increment current
    return this.source[this.current++];
  }

  isAtEnd() {
    return this.current >= this.source.length;
  }
}
class Token {

  constructor(type, lexeme, literal, line) {
    this.type = type;
    this.lexeme = lexeme;
    this.literal = literal;
    this.line = line;
  }

  toString() {
    return `${this.type} ${this.lexeme} ${this.literal} at ${this.line}`;
  }
}
class VM {
  constructor() {
    this.hadError = false;
  }

  error(line, message) {
    this.report(line, '', message);
  }

  report(line, where, message) {
    console.error(`[Line ${line}] Error ${where}: ${message}`);
    this.hadError = true;
  }
  run(source) {
    let scanner = new Scanner(source, this);
    let tokens = scanner.scanTokens();
    for (let i = 0; i < tokens.length; i++) {
      let token = tokens[i];
      console.log(`Token:${token}`);
    }
    if (this.hadError) {

    }
  }
}

let vm = new VM();
vm.run(`
    2.4
    null
    if
    let X _h3ll
    `);
