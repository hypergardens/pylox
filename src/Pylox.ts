import Lexer from './Lexer'
import Parser from './Parser'
import Interpreter from './Interpreter'
import { Token } from './Tokens'

class Pylox {
  hadError: boolean
  lexer: Lexer
  parser: Parser
  interpreter: Interpreter
  stack: Token[]
  consoleText: string[]
  silentPrograms: {}

  constructor() {
    this.hadError = false
    this.lexer = new Lexer(this)
    this.parser = new Parser(this)
    this.interpreter = new Interpreter(this)
    this.stack = []
    this.consoleText = []
    this.hadError = false
    this.silentPrograms = {}
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

  tokenise(source: string) {
    this.lexer = new Lexer(this)
    return this.lexer.scanTokens(source)
  }

  parse(source: string) {
    // TODO: figure out if a separate scanner refresh is necessary
    this.parser = new Parser(this)
    let tokens = this.tokenise(source)
    return this.parser.parse(tokens)
  }

  run(source: string) {
    // TODO: figure out if a separate interpreter refresh is necessary
    this.interpreter = new Interpreter(this)
    let tokens = this.parse(source)
    this.interpreter.loadTokens(tokens)
    return this.interpreter.interpret()
  }
}

export default Pylox
