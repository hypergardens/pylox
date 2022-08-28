import { vModelCheckbox } from 'vue'
import Interpreter from './Interpreter'
import Stox from './Stox'
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
    return new StackOperation(interpreter, {
      token,
      added: [token],
      removed: [],
    })
  },

  noop: (interpreter: Interpreter, token: Token) => {
    return new StackOperation(interpreter, { token, added: [], removed: [] })
  },

  // STACK MANIPULATION
  /////////////////////

  '@': (interpreter: Interpreter, token: Token) => {
    interpreter.checkStackSize(token, 2)
    let pullToken = interpreter.pop(token)
    if (pullToken.type === 'NUMBER') {
      // 2 @
      let depth = <number>pullToken.literal
      interpreter.checkInt(token, depth)
      interpreter.checkStackSize(token, depth)
      let pluckedToken = interpreter.pluck(token, depth)
      interpreter.place(token, 0, pluckedToken)
      return new StackOperation(interpreter, {
        token,
        added: [pluckedToken],
        removed: [pullToken, pluckedToken],
      })
    } else if (pullToken.type === 'STRING') {
      // "pi" @
      let name = <string>pullToken.literal
      let matchingName = interpreter.stack.filter((tok) => tok.name === name)
      if (matchingName.length > 0) {
        if (matchingName.length > 1) {
          interpreter.vm.error(token, `Multiple named tokens: #${name}`)
        }
        let foundToken = matchingName[0]
        let index = interpreter.stack.indexOf(foundToken)

        interpreter.stack.splice(index, 1)
        interpreter.place(token, 0, foundToken)

        return new StackOperation(interpreter, {
          token,
          added: [foundToken],
          removed: [pullToken, foundToken],
        })
      } else {
        interpreter.vm.error(token, `Named token not found: #${name}`)

        return new StackOperation(interpreter, {
          token,
          added: [],
          removed: [],
        })
      }
    } else {
      interpreter.vm.error(
        token,
        `Argument to pull token should be string or number. Found: ${pullToken.type}`
      )
      return new StackOperation(interpreter, { token, added: [], removed: [] })
    }
  },

  // 3.14 "pi"] #
  '#': (interpreter: Interpreter, token: Token) => {
    interpreter.checkStackSize(token, 2)
    let nameToken = interpreter.pop(token)
    interpreter.checkString(token, nameToken.literal)
    let namedToken = interpreter.pop(token)
    let newToken = new Token(
      namedToken.type,
      namedToken.lexeme,
      namedToken.literal,
      namedToken.xOff,
      namedToken.yOff
    )
    newToken.setName(<string>nameToken.literal)
    interpreter.place(token, 0, newToken)
    return new StackOperation(interpreter, {
      token,
      added: [newToken],
      removed: [nameToken, namedToken],
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
      token,
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
      token,
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
      token,
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
      token,
      added: [placedToken],
      removed: [depthToken, placedToken],
    })
  },

  // BASIC MATH
  /////////////
  // TODO: integrate + and * into makeBinaryOperation

  '+': (interpreter: Interpreter, token: Token) => {
    interpreter.checkStackSize(token, 2)
    let termA = interpreter.pop(token)
    let termB = interpreter.pop(token)
    if (termA.type === 'STRING' || termB.type === 'STRING') {
      let newToken = new Token(
        'STRING',
        `${<string>termA.literal + <string>termB.literal}`,
        <string>termA.literal + <string>termB.literal,
        token.xOff,
        token.yOff
      )
      interpreter.place(token, 0, newToken)
      return new StackOperation(interpreter, {
        token,
        added: [newToken],
        removed: [termA, termB],
      })
    } else if (termA.type === 'NUMBER' && termB.type === 'NUMBER') {
      let newToken = new Token(
        'NUMBER',
        `${<number>termA.literal + <number>termB.literal}`,
        <number>termA.literal + <number>termB.literal,
        token.xOff,
        token.yOff
      )
      interpreter.place(token, 0, newToken)
      return new StackOperation(interpreter, {
        token,
        added: [newToken],
        removed: [termA, termB],
      })
    } else {
      interpreter.vm.error(token, 'Invalid types for addition.')
      return new StackOperation(interpreter, { token, added: [], removed: [] })
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
          token,
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
          token,
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
        token,
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
  '>': makeBinaryOperation('>', false),
  '<': makeBinaryOperation('<', false),
  '>=': makeBinaryOperation('>=', false),
  '<=': makeBinaryOperation('<=', false),

  '==': makeBinaryOperation('==', false),
  '!=': makeBinaryOperation('!=', false),

  // LOGICAL
  //////////
  '||': makeBinaryOperation('||', true),
  '&&': makeBinaryOperation('&&', true),
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
      token,
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
    if (execToken.type !== 'STRING') {
      interpreter.vm.error(
        execToken,
        `Invalid token type for exec: ${execToken.type}`
      )
    } else if (
      execToken.lexeme[0] !== '"' ||
      execToken.lexeme[execToken.lexeme.length - 1] !== '"'
    ) {
      interpreter.vm.error(token, `No quotes around string somehow?`)
    }
    // TODO: hacky replacement
    let code = execToken.lexeme
      .slice(1, execToken.lexeme.length - 1)
      .replace(/\\\\/g, '\\')
      .replace(/\\"/g, '"')
    let clonedToken = new Token(
      execToken.type,
      code,
      execToken.literal,
      execToken.xOff,
      execToken.yOff
    )
    let tokens = interpreter.vm.stringToTokens(clonedToken, false)

    // TODO: SAMEASMACRO same as executing a string's tokens
    tokens.forEach((t) => {
      t.setParent(execToken)
    })
    interpreter.tokens.splice(interpreter.getPtr() + 1, 0, ...tokens)
    return new StackOperation(interpreter, {
      token,
      added: [...tokens],
      removed: [execToken],
    })

    // let word = <string>execToken.literal
    // // TODO: proper exec and merging with Visit Word
    // let newToken = new Token(
    //   'STRING',
    //   word,
    //   word,
    //   execToken.xOff,
    //   execToken.yOff
    // )
    // interpreter.visitWORDtoken(newToken)
  },

  print: (interpreter: Interpreter, token: Token) => {
    // print [ token
    interpreter.checkStackSize(token, 1)
    let printedToken = interpreter.pop(token)
    interpreter.print(printedToken.toString())
    return new StackOperation(interpreter, {
      token,
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
      token,
      added: [placedToken],
      removed: [condToken, ifTruthy, ifFalsy],
    })
  },
}

function makeBinaryOperation(symbol: string, castOperandsToBool = false) {
  return (interpreter: Interpreter, token: Token) => {
    // make sure it's two literals on the stack
    // pop them into termA and termB
    interpreter.checkStackSize(token, 2)
    let tokenA = interpreter.pop(token)
    let termA = tokenA.literal
    interpreter.checkNumber(token, tokenA.literal)
    let tokenB = interpreter.pop(token)
    let termB = tokenB.literal
    interpreter.checkNumber(token, tokenB.literal)

    // cast to bool if necessary
    // TODO: decide about non-bool operands and shortcircuiting
    if (castOperandsToBool) {
      interpreter.checkBool(token, tokenA.literal)
      termA = termA === 0 ? 0 : 1
      interpreter.checkBool(token, tokenB.literal)
      termB = termB === 0 ? 0 : 1
    }
    // VULN: undefined result
    let result
    let numberA = <number>termA
    let numberB = <number>termB
    switch (symbol) {
      // classic binary ops
      // case '+':
      //   break
      case '-':
        result = numberA - numberB
        break
      case '/':
        result = numberA / numberB
        break
      case '%':
        result = numberA % numberB
        break

      // TODO: test for logical with numbers
      // castOperandsToBool is true
      case '||':
        result = numberA || numberB
        break
      case '&&':
        result = numberA && numberB
        break
      // comparisons
      case '>':
        result = numberA > numberB ? 1 : 0
        break
      case '>=':
        result = numberA >= numberB ? 1 : 0
        break
      case '<':
        result = numberA < numberB ? 1 : 0
        break
      case '<=':
        result = numberA <= numberB ? 1 : 0
        break
      case '==':
        result =
          tokenA.type === tokenB.type && tokenA.literal === tokenB.literal
            ? 1
            : 0
        break
      case '!=':
        result =
          tokenA.type === tokenB.type && tokenA.literal === tokenB.literal
            ? 0
            : 1
        break
      default:
        interpreter.vm.error(token, `Invalid operation`)
    }

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
      token,
      added: [newToken],
      removed: [tokenA, tokenB],
    })
  }
}
