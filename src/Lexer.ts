import { Token } from './Tokens'
import Pylox from './Pylox'
class Lexer {
  source: string
  start: number
  current: number
  xOff: number
  yOff: number
  tokens: Token[]
  vm: Pylox

  constructor(vm: Pylox) {
    this.source = ''
    this.start = 0
    this.current = 0
    this.xOff = 0
    this.yOff = 0
    this.tokens = []
    this.vm = vm
  }

  scanTokens(source: string) {
    this.source = source
    while (!this.isAtEnd()) {
      this.start = this.current
      this.scanToken()
    }
    this.tokens.push(new Token('EOF', '', null, this.xOff, this.yOff))
    return this.tokens
  }

  scanToken() {
    let char = this.advance()
    if (char === `-`) {
      // -
      if (this.isDigit(this.peek())) {
        // -123
        console.log(`negative nr`)
        this.number()
      } else {
        // - :abc
        this.wordOrLabel()
      }
    } else if (char === `/` && this.match(`/`)) {
      this.comment()
    } else if (char === `"`) {
      this.string()
    } else if (char === `~`) {
      this.addToken('TILDE')
      this.advance()
      // this.string();
    } else if (char === `\n`) {
      this.addToken('NEWLINE')
      this.backToLeft()
    } else if (this.isDigit(char)) {
      this.number()
    } else if (this.isCharacter(char)) {
      this.wordOrLabel()
    } else if (this.isWhitespace(char)) {
      this.whitespace()
    } else {
      // this.word();
      // TODO: clean this up
      this.vm.error(this.makeToken('BAD'), `Unexpected character ${char}.`)
    }
  }

  wordOrLabel() {
    while (this.isAlphaNumeric(this.peek()) && !this.isAtEnd()) this.advance()
    let type, text
    if (this.peek(-1) === ':') {
      // start label abc:
      text = this.source.slice(this.start, this.current)
      this.addToken('LABEL', 1)
      // console.log(`start-label: ${text}`);
    } else if (this.peek(-1) === ';') {
      // end label abc;
      text = this.source.slice(this.start, this.current)
      this.addToken('LABEL', 0)
      // console.log(`end-label: ${text}`);
    } else {
      // normal word abc
      let map = {
        null: 'NULL',
      }
      text = this.source.slice(this.start, this.current)
      type = map[text]
      if (type === undefined) type = 'WORD'
      // word unless mapped to null
      this.addToken(type)
    }
  }

  number() {
    // consume digits
    while (this.isDigit(this.peek())) this.advance()

    if (this.peek() == '.' && this.isDigit(this.peek(1))) {
      // consume "."
      this.advance()

      // consume fractional part
      while (this.isDigit(this.peek())) this.advance()
    }
    this.addToken('NUMBER', Number(this.source.slice(this.start, this.current)))
  }

  comment() {
    while (this.peek() != '\n' && !this.isAtEnd()) {
      this.advance()
    }
    this.addToken('COMMENT')
  }

  string() {
    // TODO: unescape \" like characters
    // consume characters
    while (this.peek() != `"` && !this.isAtEnd()) {
      if (this.peek() == '\n') {
        this.backToLeft()
      }
      this.advance()
    }

    if (this.isAtEnd()) {
      this.vm.error(this.makeToken('BAD'), 'Unterminated string.')
    }

    // the closing "
    this.advance()
    let value = this.source.slice(this.start + 1, this.current - 1)
    this.addToken('STRING', value)
  }

  whitespace() {
    // TODO: unescape \" like characters
    // consume characters
    while (this.isWhitespace(this.peek()) && !this.isAtEnd()) {
      this.advance()
    }
    let value = this.source.slice(this.start, this.current)
    this.addToken('WHITESPACE')
  }

  match(expected: string) {
    if (this.current + expected.length >= this.source.length) return false
    if (
      this.source.slice(this.current, this.current + expected.length) !=
      expected
    )
      return false
    this.advance()
    return true
  }

  peek(n: number = 0) {
    if (this.current + n >= this.source.length) return '\0'
    return this.source[this.current + n]
  }

  isCharacter(char: string) {
    return char !== '' && !this.isWhitespace(char) && !this.isDigit(char)
    // return "/:;_abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".indexOf(char) !== -1;
  }

  isAlphaNumeric(char: string) {
    return this.isDigit(char) || this.isCharacter(char)
  }

  isDigit(char: string) {
    return '0123456789'.indexOf(char) !== -1
  }
  isWhitespace(char: string) {
    return ' \r\t\n'.indexOf(char) !== -1
  }

  addToken(
    type: string,
    literal: number | string | null | undefined = undefined
  ) {
    this.tokens.push(this.makeToken(type, literal))
  }

  makeToken(type: string, literal: number | string | null = null) {
    let text = this.source.slice(this.start, this.current)
    let token = new Token(type, text, literal, this.xOff, this.yOff)
    this.xOff += text.length
    return token
  }

  backToLeft() {
    this.yOff++
    this.xOff = 0
  }

  advance(n: number = 1) {
    // return current char and increment current
    let slice = this.source.slice(this.current, this.current + n)
    this.current += n
    return slice
  }

  isAtEnd() {
    return this.current >= this.source.length
  }
}

export default Lexer
