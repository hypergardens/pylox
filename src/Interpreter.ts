import { Library } from './StandardLib'
import { Token, TokenTypes, canVisitTokens } from './Tokens'
import Pylox from './Pylox'
class Interpreter {
  vm: Pylox
  tokens: Token[]
  stack: (number | string | null | undefined)[]
  ignoring: {}
  ptr: number[]
  execOutput: string[]
  steps: number
  maxSteps: number
  programs: string[]

  constructor(vm: Pylox) {
    canVisitTokens(this)

    this.vm = vm

    this.tokens = []
    this.stack = []
    this.ignoring = {}
    this.ptr = []
    this.execOutput = []
    this.steps = 0
    this.maxSteps = 2000
    this.programs = ['main']
  }
  loadTokens(tokens: Token[]): void {
    this.tokens.push(...tokens)
  }
  interpret() {
    let executed = false
    let silent = !this.shouldLog()

    if (!silent) {
      this.execOutput.push(`╔════════╗`)
      this.execOutput.push(`${this.programs.slice(1)}: exec`)
    }
    try {
      // start executing topmost program
      this.ptr.push(0)
      while (this.getPtr() < this.tokens.length) {
        let executedNow = this.execToken()
        executed = executed || executedNow
        this.advancePtr()
      }
      // exit to previous scope
      this.ptr.pop()
    } catch (error) {
      // look for VM errors first
      if (error.token) {
        this.vm.error(error.token, error.message)
      } else {
        throw error
      }
    }

    if (!silent) {
      this.execOutput.push(`╚════════╝`)
    }
    return executed
  }

  execToken(): boolean {
    let token = this.peek()
    // console.log(`execToken '${token.lexeme}'#${this.ptr}`);
    // console.log(this.programs.toString());
    if (
      ['WHITESPACE', 'NEWLINE', 'LABEL', 'COMMENT'].indexOf(token.type) !== -1
    ) {
      // ignore whitespace and labels
      return false
    } else {
      let program = this.getProgram()

      // main program or specific program token
      if (
        (program === 'main' && token.programs.length === 0) ||
        (program !== 'main' && token.programs.indexOf(program) !== -1)
      ) {
        // console.log(`Accepting token @${this.ptr}{${token.lexeme} ${token.type}}`);
        this.steps += 1
        if (this.steps > this.maxSteps) {
          this.vm.error(token, 'Too many steps.')
          throw `INFINITE LOOP`
        } else {
          token.accept(this)
          if (this.shouldLog()) {
            this.execOutput.push(
              `${token.lexeme.padStart(8, ' ')} → [${this.stack
                .slice()
                .reverse()
                .toString()
                .padEnd(10, ' ')}`
            )
          }
          return true
        }
      } else {
        // console.log(`Skipping token @${this.ptr}{${token.lexeme} ${token.type}}`);
        return false
      }
    }
  }
  shouldLog() {
    let token = this.peek()
    for (let program of this.programs) {
      if (this.vm.silentPrograms[program] === true) {
        return false
      }
    }
    return true
  }

  peek() {
    return this.tokens[this.getPtr()]
  }
  advancePtr() {
    this.ptr[this.ptr.length - 1]++
  }
  getPtr() {
    return this.ptr[this.ptr.length - 1]
  }
  getProgram() {
    return this.programs[this.programs.length - 1]
  }

  visitWORDtoken(token) {
    let word = token.lexeme
    let termA, termB, termC

    if (Library[word] !== undefined) {
      Library[word].execute(this)
    }

    switch (word) {
      case 'noop':
        break

      case '@':
        // @ [x ... x-th ...
        this.checkStackSize(token, 1)
        termA = this.stack.pop()
        this.checkInt(token, termA)
        this.checkStackSize(token, termA)
        termB = this.top(token, termA)
        this.delete(token, termA)
        // delete element from where it was
        this.stack.push(termB)
        break

      case '?':
        // ? [cond ifTrue ifFalse ...
        this.checkStackSize(token, 3)
        termA = this.stack.pop()
        termB = this.stack.pop()
        termC = this.stack.pop()
        if (termA !== 0) {
          this.stack.push(termB)
        } else {
          this.stack.push(termC)
        }
        break

      case 'exec':
        this.checkStackSize(token, 1)
        termA = this.stack.pop()
        this.visitWORDtoken({ lexeme: termA })
        break

      case 'print':
        this.checkStackSize(token, 1)
        termA = this.stack.pop()
        this.print(termA)
        break

      case 'del':
        this.checkStackSize(token, 1)
        termA = this.stack.pop()
        this.checkStackSize(token, termA)
        this.delete(token, termA)
        break

      case 'put':
        this.checkStackSize(token, 2)
        termA = this.stack.pop()
        termB = this.stack.pop()
        this.place(token, termA, termB)
        break

      case 'copy':
        this.checkStackSize(token, 1)
        termA = this.stack.pop()
        this.checkInt(token, termA)
        this.checkStackSize(token, termA)
        termB = this.top(token, termA)
        this.stack.push(termB)
        break

      case 'dup':
        this.checkStackSize(token, 1)
        let value = this.stack.pop()
        this.stack.push(value, value)
        break

      case '>':
        this.checkStackSize(token, 2)
        termA = this.stack.pop()
        termB = this.stack.pop()
        this.checkNumber(token, termA)
        this.checkNumber(token, termB)
        if (termA > termB) this.stack.push(1)
        else this.stack.push(0)
        break

      case '>=':
        this.checkStackSize(token, 2)
        termA = this.stack.pop()
        termB = this.stack.pop()
        this.checkNumber(token, termA)
        this.checkNumber(token, termB)
        if (termA >= termB) this.stack.push(1)
        else this.stack.push(0)
        break

      case '<':
        this.checkStackSize(token, 2)
        termA = this.stack.pop()
        termB = this.stack.pop()
        this.checkNumber(token, termA)
        this.checkNumber(token, termB)
        if (termA < termB) this.stack.push(1)
        else this.stack.push(0)
        break

      case '<=':
        this.checkStackSize(token, 2)
        termA = this.stack.pop()
        termB = this.stack.pop()
        this.checkNumber(token, termA)
        this.checkNumber(token, termB)
        if (termA <= termB) this.stack.push(1)
        else this.stack.push(0)
        break

      case '==':
        this.checkStackSize(token, 2)
        termA = this.stack.pop()
        termB = this.stack.pop()
        this.checkNumber(token, termA)
        this.checkNumber(token, termB)
        if (termA === termB) this.stack.push(1)
        else this.stack.push(0)
        break

      case '!=':
        this.checkStackSize(token, 2)
        termA = this.stack.pop()
        termB = this.stack.pop()
        this.checkNumber(token, termA)
        this.checkNumber(token, termB)
        if (termA !== termB) this.stack.push(1)
        else this.stack.push(0)
        break

      case '+':
        this.checkStackSize(token, 2)
        termA = this.stack.pop()
        termB = this.stack.pop()
        // this.print(`${termA} + ${termB} = ${termA + termB}`);
        this.stack.push(termA + termB)
        break

      case '*':
        this.checkStackSize(token, 2)
        termA = this.stack.pop()
        termB = this.stack.pop()
        this.checkNumber(token, termA)
        this.checkNumber(token, termB)
        this.stack.push(termA * termB)
        break

      case '/':
        this.checkStackSize(token, 2)
        termA = this.stack.pop()
        termB = this.stack.pop()
        this.checkNumber(token, termA)
        this.checkNumber(token, termB)
        this.stack.push(termA / termB)
        break

      case '%':
        this.checkStackSize(token, 2)
        termA = this.stack.pop()
        termB = this.stack.pop()
        this.checkNumber(token, termA)
        this.checkNumber(token, termB)
        this.stack.push(termA % termB)
        break

      case '-':
        this.checkStackSize(token, 2)
        termA = this.stack.pop()
        termB = this.stack.pop()
        this.checkNumber(token, termA)
        this.checkNumber(token, termB)
        this.stack.push(termA - termB)
        break

      case '!':
        this.checkStackSize(token, 1)
        this.checkBools(token, 1)
        this.stack.push(1 - Number(this.stack.pop()))
        break

      case '||':
        this.checkStackSize(token, 1)
        this.checkBools(token, 2)
        termA = this.stack.pop()
        termB = this.stack.pop()
        this.stack.push(termA || termB)
        break

      case '&&':
        this.checkStackSize(token, 1)
        this.checkBools(token, 2)
        termA = this.stack.pop()
        termB = this.stack.pop()
        this.stack.push(termA && termB)
        break

      default:
        // execute program
        // console.log(`Executing ${ word } program`);
        this.programs.push(word)
        // TODO: executed refinements for empty programs
        let executed = this.interpret()
        if (!executed) {
          this.vm.error(token, `Word not found.`)
        }
        this.programs.pop()
        // this.execOutput.push(`end exec [${this.stack.slice().reverse().toString().padEnd(10, " ")}`);
        break
    }
  }
  visitLABELtoken(token: Token) {}
  visitSTRINGtoken(token: Token) {
    // this.place(token, token.literal, 0);
    this.stack.push(token.literal)
    return this.stack
  }
  visitNUMBERtoken(token: Token) {
    // this.place(token, token.literal, 0);
    this.stack.push(token.literal)
    return this.stack
  }
  visitNULLtoken(token: Token) {
    // this.place(token, token.literal, 0);
    this.stack.push(token.literal)
    return this.stack
  }
  visitWHITESPACEtoken(token: Token) {}
  visitNEWLINEtoken(token: Token) {}
  visitCOMMENTtoken(token: Token) {}
  visitEOFtoken(token: Token) {}

  top(token: Token, n: number) {
    if (n < 0) {
      this.checkStackSize(token, Math.abs(n))
      return this.stack[-n - 1]
    } else if (n >= 0) {
      this.checkStackSize(token, n + 1)
      return this.stack[this.stack.length - n - 1]
    }
  }

  delete(token: Token, n: number) {
    if (n < 0) {
      this.checkStackSize(token, Math.abs(n))
      this.stack.splice(-n - 1, 1)
    } else if (n >= 0) {
      this.checkStackSize(token, n + 1)
      this.stack.splice(this.stack.length - n - 1, 1)
    }
  }

  place(
    token: Token,
    element: number | string | null | undefined,
    where: number
  ) {
    this.checkStackSize(token, where)
    // this.print(where);
    this.checkInt(token, where)
    if (where >= 0) {
      this.stack.splice(this.stack.length - where, 0, element)
    } else {
      this.stack.splice(-1 - where, 0, element)
    }
  }

  print(msg: string) {
    this.vm.consoleText.push(msg)
  }

  checkBools(token: Token, n = 0) {
    // check 0 or 1
    for (let i = 0; i < n; i++) {
      // TODO: see if this is even allowed
      let value = <any>this.top(token, i)
      if ([1, 0].indexOf(value) === -1) {
        throw {
          token,
          message: `Must have bool operand. Found: ${value} of type ${typeof value}`,
        }
      }
    }
  }
  checkStackSize(token, n = 0) {
    if (this.stack.length < n)
      throw { token, message: `Insufficient stack size: ${n}.` }
  }
  checkNumber(token, term) {
    if (!(!isNaN(parseFloat(term)) && isFinite(term))) {
      throw { token, message: `${term} is not a number.` }
    }
  }
  checkInt(token, term) {
    if (!Number.isInteger(term)) {
      throw { token, message: `${term} is not an integer.` }
    }
  }
}

export default Interpreter
