import Interpreter from './Interpreter'
import { StackOperation } from './StackOperation'
import { Token } from './Tokens'

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
      // 2] @
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
      // "pi"] @
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
  // elem depth] copy
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

  // elem depth] put
  put: (interpreter: Interpreter, token: Token) => {
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

  '+': makeBinaryOperation('+', {}),
  '-': makeBinaryOperation('-', { checkBothAreNumbers: true }),
  '*': makeBinaryOperation('*', {}),
  '/': makeBinaryOperation('/', { checkBothAreNumbers: true }),
  '%': makeBinaryOperation('%', { checkBothAreNumbers: true }),

  // COMPARISONS
  //////////////
  '>': makeBinaryOperation('>', { checkBothAreNumbers: true }),
  '<': makeBinaryOperation('<', { checkBothAreNumbers: true }),
  '>=': makeBinaryOperation('>=', { checkBothAreNumbers: true }),
  '<=': makeBinaryOperation('<=', { checkBothAreNumbers: true }),

  '==': makeBinaryOperation('==', {}),
  '!=': makeBinaryOperation('!=', {}),

  // LOGICAL
  //////////
  '||': makeBinaryOperation('||', { castOperandsToBool: true }),
  '&&': makeBinaryOperation('&&', { castOperandsToBool: true }),
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
    // token] exec
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
  },

  print: (interpreter: Interpreter, token: Token) => {
    // token] print
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
    // ifFalsy ifTruthy cond] ?
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

function makeBinaryOperation(
  symbol: string,
  { castOperandsToBool = false, checkBothAreNumbers = false }
) {
  return (interpreter: Interpreter, token: Token) => {
    // make sure it's two literals on the stack
    // pop them into termA and termB
    interpreter.checkStackSize(token, 2)
    let tokenA = interpreter.pop(token)
    let termA = tokenA.literal
    let tokenB = interpreter.pop(token)
    let termB = tokenB.literal

    // check both numbers
    if (checkBothAreNumbers) {
      interpreter.checkNumber(token, tokenA.literal)
      interpreter.checkNumber(token, tokenB.literal)
    }

    // cast to bool if necessary
    // TODO: decide about non-bool operands and shortcircuiting
    if (castOperandsToBool) {
      interpreter.checkBool(token, tokenA.literal)
      termA = termA === 0 ? 0 : 1
      interpreter.checkBool(token, tokenB.literal)
      termB = termB === 0 ? 0 : 1
    }
    // VULN: undefined result
    let result: string | number
    let type = 'NUMBER'
    let numberA = <number>termA
    let numberB = <number>termB
    // type bools
    let eitherIsString = tokenA.type === 'STRING' || tokenB.type === 'STRING'
    let eitherIsNumber = tokenA.type === 'NUMBER' || tokenB.type === 'NUMBER'
    let bothAreNumbers = tokenA.type === 'NUMBER' && tokenB.type === 'NUMBER'
    let stringAndNumber = tokenA.type === 'STRING' && tokenB.type === 'NUMBER'
    let numberAndString = tokenA.type === 'NUMBER' && tokenB.type === 'STRING'

    switch (symbol) {
      // classic binary ops
      case '+':
        if (bothAreNumbers) {
          result = <number>termA + <number>termB
        } else if (eitherIsString) {
          result = `${<string>termA + <string>termB}`
          type = 'STRING'
        } else {
          interpreter.vm.error(token, 'Invalid types for addition.')
          result = 0
        }
        break
      case '*':
        if (bothAreNumbers) {
          result = <number>termA * <number>termB
        } else if (numberAndString) {
          interpreter.checkInt(token, termA)
          interpreter.checkPositiveNumber(token, termA)
          result = (<string>termB).repeat(<number>termA)
          type = 'STRING'
        } else if (stringAndNumber) {
          interpreter.checkInt(token, termB)
          interpreter.checkPositiveNumber(token, termB)
          result = (<string>termA).repeat(<number>termB)
          type = 'STRING'
        } else {
          interpreter.vm.error(token, 'Invalid types for multiplication.')
          result = 0
        }
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
        // VULN: zero result just to please TS
        result = 0
        interpreter.vm.error(token, `Invalid binary operation`)
        break
    }

    let newToken = new Token(
      // number by default
      type,
      `${result}`,
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
