import { vModelCheckbox } from 'vue'
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

type LibraryType = {
  [name: string]: (interpreter: Interpreter, token: Token) => StackOperation
}

export const StandardLibrary: LibraryType = {
  push: (interpreter: Interpreter, token: Token) => {
    interpreter.place(token, 0, token)
    return new StackOperation(interpreter, { added: [token], removed: [] })
  },

  noop: (interpreter: Interpreter, token: Token) => {
    return new StackOperation(interpreter, { added: [], removed: [] })
  },

  // STACK MANIPULATION
  /////////////////////

  '@': (interpreter: Interpreter, token: Token) => {
    interpreter.checkStackSize(token, 1)
    let depthToken = interpreter.pop(token)
    let depth = <number>depthToken.literal
    interpreter.checkInt(token, depth)
    interpreter.checkStackSize(token, depth)
    let pluckedToken = interpreter.pluck(token, depth)
    interpreter.place(token, 0, pluckedToken)
    return new StackOperation(interpreter, {
      added: [pluckedToken],
      removed: [depthToken, pluckedToken],
    })
  },

  del: (interpreter: Interpreter, token: Token) => {
    interpreter.checkStackSize(token, 1)
    let depthToken = interpreter.pop(token)
    let depth = <number>depthToken.literal
    interpreter.checkInt(token, depth)
    interpreter.checkStackSize(token, depth)
    let pluckedToken = interpreter.pluck(token, depth)
    return new StackOperation(interpreter, {
      added: [],
      removed: [depthToken, pluckedToken],
    })
  },
  copy: (interpreter: Interpreter, token: Token) => {
    interpreter.checkStackSize(token, 1)
    let depthToken = interpreter.pop(token)
    let depth = <number>depthToken.literal
    interpreter.checkInt(token, depth)
    interpreter.checkStackSize(token, depth)
    let copiedToken = interpreter.top(token, depth)
    let newToken = new Token(
      copiedToken.type,
      copiedToken.lexeme,
      copiedToken.literal,
      copiedToken.xOff,
      copiedToken.yOff
    )
    interpreter.place(token, 0, newToken)
    return new StackOperation(interpreter, {
      added: [newToken],
      removed: [],
    })
  },
  dup: (interpreter: Interpreter, token: Token) => {
    interpreter.checkStackSize(token, 1)
    let copiedToken = interpreter.top(token, 0)
    let newToken = new Token(
      copiedToken.type,
      copiedToken.lexeme,
      copiedToken.literal,
      copiedToken.xOff,
      copiedToken.yOff
    )
    interpreter.place(token, 0, newToken)
    return new StackOperation(interpreter, {
      added: [newToken],
      removed: [],
    })
  },

  // put [ depth elem
  put: (interpreter: Interpreter, token: Token) => {
    // get element
    interpreter.checkStackSize(token, 1)
    let depthToken = interpreter.pop(token)
    let depth = <number>depthToken.literal
    interpreter.checkInt(token, depth)
    interpreter.checkStackSize(token, depth)
    let placedToken = interpreter.pop(token)
    interpreter.place(token, depth, placedToken)
    return new StackOperation(interpreter, {
      added: [placedToken],
      removed: [depthToken, placedToken],
    })
  },

  // BASIC MATH
  /////////////

  '+': (interpreter: Interpreter, token: Token) => {
    interpreter.checkStackSize(token, 2)
    let termA = interpreter.pop(token)
    let termB = interpreter.pop(token)
    let newToken: Token
    if (termA.type === 'STRING' || termB.type === 'STRING') {
      let newToken = new Token(
        'STRING',
        // @ts-ignore
        `${termA.literal + termB.literal}`,
        // @ts-ignore
        termA.literal + termB.literal,
        token.xOff,
        token.yOff
      )
      interpreter.place(token, 0, newToken)
      return new StackOperation(interpreter, {
        added: [newToken],
        removed: [termA, termB],
      })
    } else if (termA.type === 'NUMBER' && termB.type === 'NUMBER') {
      let newToken = new Token(
        'NUMBER',
        // @ts-ignore
        `${termA.literal + termB.literal}`,
        // @ts-ignore
        termA.literal + termB.literal,
        token.xOff,
        token.yOff
      )
      interpreter.place(token, 0, newToken)
      return new StackOperation(interpreter, {
        added: [newToken],
        removed: [termA, termB],
      })
    } else {
      // interpreter.vm.error(token, 'Invalid types for addition.')
      return new StackOperation(interpreter, { added: [], removed: [] })
    }
  },
  '*': (interpreter: Interpreter, token: Token) => {
    interpreter.checkStackSize(token, 2)
    let termA = interpreter.pop(token)
    let termB = interpreter.pop(token)
    if (termA.type === 'STRING' && termB.type === 'NUMBER') {
      // check positive integer
      if (
        !(
          <number>termB.literal > 0 &&
          interpreter.checkInt(token, termB.literal)
        )
      ) {
        interpreter.vm.error(token, 'Repeat number must be positive integer')
        return new StackOperation(interpreter, {
          added: [],
          removed: [],
        })
      } else {
        // repeat string
        let newToken = new Token(
          'STRING',
          // @ts-ignore
          `${termA.literal.repeat(termB.literal)}`,
          // @ts-ignore
          termA.literal.repeat(termB.literal),
          termA.xOff,
          termA.yOff
        )
        interpreter.place(token, 0, newToken)
        return new StackOperation(interpreter, {
          added: [newToken],
          removed: [termA, termB],
        })
      }
    } else {
      interpreter.checkNumber(token, termA.literal)
      interpreter.checkNumber(token, termB.literal)
      let newToken = new Token(
        'NUMBER',
        // @ts-ignore
        `${termA.literal * termB.literal}`,
        // @ts-ignore
        termA.literal * termB.literal,
        token.xOff,
        token.yOff
      )
      interpreter.place(token, 0, newToken)
      return new StackOperation(interpreter, {
        added: [newToken],
        removed: [termA, termB],
      })
    }
  },

  '-': makeBinaryOperation('-'),
  '/': makeBinaryOperation('/'),
  '%': makeBinaryOperation('%'),

  // COMPARISONS
  //////////////
  '>': makeBinaryOperation('>', true),
  '<': makeBinaryOperation('<', true),
  '>=': makeBinaryOperation('>=', true),
  '<=': makeBinaryOperation('<=', true),

  '==': makeEqualityOperation('==', false),
  '!=': makeEqualityOperation('!=', true),

  // LOGICAL
  //////////
  '||': makeBinaryOperation('||', true, true),
  '&&': makeBinaryOperation('&&', true, true),
  '!': (interpreter: Interpreter, token: Token) => {
    interpreter.checkStackSize(token, 1)
    let negatedToken = interpreter.pop(token)
    let result = negatedToken.literal === 0 ? 1 : 0
    let newToken = new Token(
      'NUMBER',
      `${result}`,
      result,
      token.xOff,
      token.yOff
    )
    return new StackOperation(interpreter, {
      added: [newToken],
      removed: [negatedToken],
    })
  },

  // BASICS
  /////////

  exec: (interpreter: Interpreter, token: Token) => {
    // print [ token
    interpreter.checkStackSize(token, 1)
    let execToken = interpreter.pop(token)
    if (execToken.type !== 'STRING')
      interpreter.vm.error(
        execToken,
        `Invalid token type for exec: ${execToken.type}`
      )
    let word = <string>execToken.literal
    // TODO: proper exec and merging with Visit Word
    let newToken = new Token(
      'STRING',
      word,
      word,
      execToken.xOff,
      execToken.yOff
    )
    interpreter.visitWORDtoken(newToken)
    let stackOp = new StackOperation(interpreter, {
      added: [],
      removed: [execToken],
    })
    return stackOp
  },

  print: (interpreter: Interpreter, token: Token) => {
    // print [ token
    interpreter.checkStackSize(token, 1)
    let printedToken = interpreter.pop(token)
    interpreter.print(printedToken.toString())
    return new StackOperation(interpreter, {
      added: [],
      removed: [printedToken],
    })
  },

  '?': (interpreter: Interpreter, token: Token) => {
    // ? [cond ifTruthy ifFalsy ...
    interpreter.checkStackSize(token, 3)
    let condToken = <Token>interpreter.stack.pop()
    let ifTruthy = <Token>interpreter.stack.pop()
    let ifFalsy = <Token>interpreter.stack.pop()
    let placedToken = condToken.literal !== 0 ? ifTruthy : ifFalsy
    interpreter.stack.push(placedToken)
    return new StackOperation(interpreter, {
      added: [placedToken],
      removed: [condToken, ifTruthy, ifFalsy],
    })
  },
}

function makeBinaryOperation(
  symbol: string,
  castResultToBool = false,
  castOperandsToBool = false
) {
  return (interpreter: Interpreter, token: Token) => {
    interpreter.checkStackSize(token, 2)
    let tokenA = interpreter.pop(token)
    let termA = tokenA.literal
    interpreter.checkNumber(token, tokenA.literal)
    let tokenB = interpreter.pop(token)
    let termB = tokenA.literal
    interpreter.checkNumber(token, tokenB.literal)

    if (castOperandsToBool) {
      interpreter.checkBool(token, tokenA.literal)
      termA = termA === 0 ? 0 : 1
      interpreter.checkBool(token, tokenB.literal)
      termB = termB === 0 ? 0 : 1
    }
    let evalString = `${termA} ${symbol} ${termB}`
    let result = eval(evalString)
    if (castResultToBool) result = result === 0 || result === false ? 0 : 1
    let newToken = new Token(
      'NUMBER',
      // @ts-ignore
      `${result}`,
      // @ts-ignore
      result,
      token.xOff,
      token.yOff
    )
    interpreter.place(token, 0, newToken)
    return new StackOperation(interpreter, {
      added: [newToken],
      removed: [tokenA, tokenB],
    })
  }
}
function makeEqualityOperation(symbol: string, reverse = false) {
  return (interpreter: Interpreter, token: Token) => {
    interpreter.checkStackSize(token, 2)
    let tokenA = interpreter.pop(token)
    let tokenB = interpreter.pop(token)
    let result = 0
    if (tokenA.type === tokenB.type && tokenA.literal === tokenB.literal) {
      result = 1
    }
    if (reverse) result = 1 - result
    let newToken = new Token(
      'NUMBER',
      // @ts-ignore
      `${result}`,
      // @ts-ignore
      result,
      token.xOff,
      token.yOff
    )
    interpreter.place(token, 0, newToken)
    return new StackOperation(interpreter, {
      added: [newToken],
      removed: [tokenA, tokenB],
    })
  }
}
