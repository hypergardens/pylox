import Interpreter from './Interpreter'
import { Token } from './Tokens'

export class StackOperation {
  added: Token[]
  removed: Token[]
  step: number
  token: Token
  stack: Token[]

  constructor(
    interpreter: Interpreter,
    { added, removed }: { added: Token[]; removed: Token[] }
  ) {
    this.step = interpreter.steps
    this.token = interpreter.peek()
    this.added = added
    this.removed = removed
    this.stack = interpreter.stack.slice()
  }
  toString() {
    // let text = `${this.token.lexeme.padStart(8, ' ')} → [${this.stack
    //   .slice()
    //   .reverse()
    //   .toString()
    //   .padEnd(10, ' ')}`
    let text = `${this.token.lexeme.padStart(8, ' ')} → [${this.stack}\nin ${
      this.added
    }, out ${this.removed}`
    return text
  }
}
