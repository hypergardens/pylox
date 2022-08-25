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
    {
      token,
      added,
      removed,
    }: { token: Token; added: Token[]; removed: Token[] }
  ) {
    this.step = interpreter.step
    this.token = interpreter.peek()
    this.added = added
    this.removed = removed
    this.stack = interpreter.stack.slice()
  }
  toString() {
    let text =
      `${this.stack}] `.padStart(20) +
      `← ${this.token.lexeme} at ${this.step}    (+${this.added.length}, -${this.removed.length})`.padEnd(
        40
      )
    return text
  }
}
