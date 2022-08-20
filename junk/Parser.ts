import Stox from './Stox'
import { Token } from './Tokens'
class Parser {
  vm: Stox
  current: number
  tokens: Token[]
  programs: string[]

  constructor(vm: Stox) {
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
