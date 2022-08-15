import Interpreter from './Interpreter'
import { Token } from './Tokens'

export class StackOperation {
  added: Token[]
  removed: Token[]
  step: number
  token: Token

  constructor(interpreter: Interpreter, added: Token[], removed: Token[]) {
    this.step = interpreter.steps
    this.token = interpreter.peek()
    this.added = added
    this.removed = removed
  }
}
