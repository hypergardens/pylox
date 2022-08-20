import Lexer from './Lexer'
import Interpreter from './Interpreter'
import { Token } from './Tokens'

class Stox {
  hadError: boolean
  interpreter: Interpreter
  consoleText: string[]

  constructor() {
    this.interpreter = new Interpreter(this)
    this.consoleText = []
    this.hadError = false
    Token.uid = 0
  }

  report(line: number, where: string, message: string) {
    let errMsg = `[Line ${line}] Error ${where}: ${message}`
    console.error(errMsg)
    this.hadError = true
    this.consoleText.push(errMsg)
  }

  error(token: Token, message: string) {
    if (token.type === 'EOF') {
      this.report(token.yOff, ` at end`, message)
    } else {
      this.report(token.yOff, ` at '${token.lexeme}'`, message)
    }
  }

  stringToTokens(source: string | Token) {
    let lexer = new Lexer(this)
    let tokens: Token[] = []
    if (typeof source === 'string') {
      tokens = lexer.scanTokens(source)
    } else if (source instanceof Token) {
      lexer.xOff = source.xOff + 1
      lexer.yOff = source.yOff
      tokens = lexer.scanTokens(source.lexeme)
      tokens.forEach((t) => t.setPrograms(source.programs))
    }
    return tokens
  }

  load(source: string) {
    let tokens = this.stringToTokens(source)
    this.interpreter.loadSourceTokens(tokens)
  }

  run(source: string) {
    this.load(source)
    return this.interpreter.interpret()
  }
}

export default Stox
