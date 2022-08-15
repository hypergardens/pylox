import Pylox from './Pylox'
import { Token } from './Tokens'
class Parser {
  vm: Pylox
  current: number
  tokens: Token[]
  programs: string[]

  constructor(vm: Pylox) {
    this.vm = vm
    this.current = 0
    this.tokens = []
    this.programs = []
  }

  parse(tokens: Token[]): Token[] {
    this.tokens = tokens
    for (let token of tokens) {
      // console.log(token.toString());
      this.parseToken()
    }

    return tokens
  }

  parseToken(): Token | undefined {
    // set previously accumulated programs
    this.peek().setPrograms(this.programs)
    // console.log(`${this.peek().programs}-->${this.peek().lexeme}`);
    // console.log(this.peek());

    if (
      this.match(
        `WORD`,
        `STRING`,
        `NUMBER`,
        `NULL`,
        `WHITESPACE`,
        `NEWLINE`,
        `COMMENT`,
        `EOF`
      )
    ) {
      return this.previous()
    } else if (this.match(`LABEL`)) {
      return this.handleLabel()
    } else {
      // ???
      let token = this.peek()
      this.error(
        token,
        `Parser: unexpected token: ${this.tokens[this.current]} `
      )
      // this.advance();
    }
  }

  handleLabel(): Token {
    // abc: abc;
    // take previous token as label
    let token = this.previous()
    let lexeme = token.lexeme

    if (lexeme[lexeme.length - 1] === `:`) {
      // abc:
      // add program to array
      let label = lexeme.slice(0, lexeme.length - 1)
      // console.log(`at token ${token} starting label ${label}`);

      // eat whitespace
      while (this.match('WHITESPACE')) {}

      // if followed by comment, nonlog
      if (this.peek().type === 'COMMENT') {
        this.vm.silentPrograms[label] = true
      }

      this.programs.push(label)
      // exec till label;
    } else if (lexeme[lexeme.length - 1] === `;`) {
      // remove program from array
      let label = lexeme.slice(0, lexeme.length - 1)
      // console.log(`at token ${token} ending label ${label}`);
      if (this.programs.indexOf(label) !== -1) {
        this.programs.splice(this.programs.indexOf(label), 1)
      } else {
        this.vm.error(token, 'Label finished without beginning.')
      }
    } else {
      this.vm.error(
        token,
        "I don't know what's going on but this is where it is."
      )
    }
    return token
  }

  match(...types: string[]): boolean {
    // consumes a token if it's a given type
    for (let type of types) {
      if (this.check(type)) {
        this.advance()
        return true
      }
    }
    return false
  }

  consume(type: string, message: string): Token {
    // TODO: implement with catch?
    if (this.check(type)) return this.advance()
    throw { token: this.peek(), message }
  }

  check(type): boolean {
    // TODO: hack?
    if (this.isAtEnd() && this.peek().type !== 'EOF') return false
    return this.peek().type === type
  }

  advance(): Token {
    if (!this.isAtEnd()) this.current++
    return this.previous()
  }

  isAtEnd(): boolean {
    return this.peek().type === 'EOF'
  }

  peek(n: number = 0): Token {
    let token: Token
    if (this.current + n > this.tokens.length) {
      token = this.tokens[this.tokens.length - 1]
    } else {
      token = this.tokens[this.current + n]
    }
    return token
  }

  previous(): Token {
    return this.tokens[this.current - 1]
  }

  error(token, message): { token: any; message: any } {
    this.vm.error(token, message)
    return { token, message }
  }

  synchronise(): void {
    this.advance()

    while (!this.isAtEnd()) {
      if (this.previous().type === 'WHITESPACE') {
        return
      }
    }
  }
}

export default Parser
