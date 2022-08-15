import Interpreter from './Interpreter'
import Pylox from './Pylox'
import { StackOperation } from './StackOperation'
import { Token } from './Tokens'

// class Library {
//   lib: { string: Function }
//   constructor() {
//     this.lib = {}
//   }
//   addOp(word: string, execution: Function) {
//     this.lib[word] = execution
//   }
// }

type Library = {
  [name: string]: (interpreter: Interpreter, token: Token) => StackOperation
}

export const StandardLibrary: Library = {
  noop: (interpreter: Interpreter, token: Token) => {
    return new StackOperation(interpreter, [], [])
  },
  '@': (interpreter: Interpreter, token: Token) => {
    interpreter.checkStackSize(token, 1)
    let termA = interpreter.stack.pop()
    interpreter.checkInt(token, termA)
    interpreter.checkStackSize(token, <number>termA)
    let termB = interpreter.pluck(token, <number>termA)
    return new StackOperation(interpreter, [termB], [termA])
  },
}
// StandardLibrary  = {
//   `noop`: (interpreter: Interpreter) => {
//     return new StackOperation(interpreter, [], [])

//   }

//   '+': {
//     execute(interpreter: Interpreter): StackOperation {
//       interpreter.checkStackSize(token, 2)
//       let termA = interpreter.stack.pop()
//       let termB = interpreter.stack.pop()
//       // this.print(`${termA} + ${termB} = ${termA + termB}`);
//       interpreter.stack.push(termA + termB)
//       return new StackOperation(interpreter, [], [])
//     },
//   },
// }
