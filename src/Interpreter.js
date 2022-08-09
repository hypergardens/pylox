import { TokenTypes } from "./TokenTypes";

class Interpreter {
  constructor(vm) {
    TokenTypes.canVisitTokens(this);
    this.vm = vm;

    this.tokens = [];
    this.stack = [];
    this.ignoring = {};
    this.ptr = [];
    this.execOutput = [];
    this.steps = 0;
    this.maxSteps = 2000;
    this.programs = ["main"];
  }
  loadTokens(tokens) {
    this.tokens.push(...tokens);
  }
  interpret() {
    let executed = false;
    try {
      this.ptr.push(0);
      while (this.getPtr() < this.tokens.length) {
        let executedNow = this.execToken();
        executed = executed || executedNow;
        this.advancePtr();
      }
      this.ptr.pop();
    } catch (error) {
      if (error.token) {
        this.vm.error(error.token, error.message);
      }
      else {
        throw error;
      }
    }
    return executed;
  }

  execToken() {
    let token = this.tokens[this.getPtr()];
    // console.log(`execToken '${token.lexeme}'#${this.ptr}`);
    // console.log(this.programs.toString());
    if (["WHITESPACE", "NEWLINE", "LABEL", "COMMENT"].indexOf(token.type) !== -1) {
      // ignore whitespace and labels

    } else {
      let program = this.getProgram();

      // show stack it shall apply to
      if (program === "main" && token.programs.length === 0 ||
        program !== "main" && token.programs.indexOf(program) !== -1) {
        // main program or specific program token

        // console.log(`Accepting token @${this.ptr}{${token.lexeme} ${token.type}}`);
        this.steps += 1;
        if (this.steps > this.maxSteps) {
          this.vm.error(token, 'Too many steps.');
          throw `INFINITE LOOP`;
        } else {
          token.accept(this);
          this.execOutput.push(`${token.lexeme.padStart(8, " ")} → [${this.stack.slice().reverse().toString().padEnd(10, " ")}`);
          return true;
        }
      } else {
        // console.log(`Skipping token @${this.ptr}{${token.lexeme} ${token.type}}`);
        return false;
      }
    }
  }

  advancePtr() {
    this.ptr[this.ptr.length - 1]++;
  }
  getPtr() {
    return this.ptr[this.ptr.length - 1];
  }
  getProgram() {
    return this.programs[this.programs.length - 1];
  }

  visitWORDtoken(token) {
    let word = token.lexeme;
    let termA, termB, termC;
    switch (word) {
      case 'noop':
        break;

      case '@':
        // @ [x ... x-th ...
        this.checkStackSize(token, 1);
        termA = this.stack.pop();
        this.checkInt(token, termA);
        this.checkStackSize(token, termA);
        termB = this.top(token, termA);
        this.delete(token, termA);
        // delete element from where it was
        this.stack.push(termB);
        break;

      case '?':
        // ? [cond ifTrue ifFalse ...
        this.checkStackSize(token, 3);
        termA = this.stack.pop();
        termB = this.stack.pop();
        termC = this.stack.pop();
        if (termA !== 0) {
          this.stack.push(termB);
        } else {
          this.stack.push(termC);
        }
        break;

      case 'exec':
        this.checkStackSize(token, 1);
        termA = this.stack.pop();
        this.visitWORDtoken({ lexeme: termA });
        break;

      case 'print':
        this.checkStackSize(token, 1);
        termA = this.stack.pop();
        this.print(termA);
        break;

      case 'del':
        this.checkStackSize(token, 1);
        termA = this.stack.pop();
        this.checkStackSize(token, termA);
        this.delete(token, termA);
        break;

      case 'put':
        this.checkStackSize(token, 2);
        termA = this.stack.pop();
        termB = this.stack.pop();
        this.place(token, termA, termB);
        break;

      case 'copy':
        this.checkStackSize(token, 1);
        termA = this.stack.pop();
        this.checkInt(token, termA);
        this.checkStackSize(token, termA);
        termB = this.top(token, termA);
        this.stack.push(termB);
        break;

      case 'dup':
        this.checkStackSize(token, 1);
        let value = this.stack.pop();
        this.stack.push(value, value);
        break;


      case '>':
        this.checkStackSize(token, 2);
        termA = this.stack.pop();
        termB = this.stack.pop();
        this.checkNumber(token, termA);
        this.checkNumber(token, termB);
        if (termA > termB)
          this.stack.push(1);
        else
          this.stack.push(0);
        break;

      case '>=':
        this.checkStackSize(token, 2);
        termA = this.stack.pop();
        termB = this.stack.pop();
        this.checkNumber(token, termA);
        this.checkNumber(token, termB);
        if (termA >= termB)
          this.stack.push(1);
        else
          this.stack.push(0);
        break;

      case '<':
        this.checkStackSize(token, 2);
        termA = this.stack.pop();
        termB = this.stack.pop();
        this.checkNumber(token, termA);
        this.checkNumber(token, termB);
        if (termA < termB)
          this.stack.push(1);
        else
          this.stack.push(0);
        break;

      case '<=':
        this.checkStackSize(token, 2);
        termA = this.stack.pop();
        termB = this.stack.pop();
        this.checkNumber(token, termA);
        this.checkNumber(token, termB);
        if (termA <= termB)
          this.stack.push(1);
        else
          this.stack.push(0);
        break;

      case '==':
        this.checkStackSize(token, 2);
        termA = this.stack.pop();
        termB = this.stack.pop();
        this.checkNumber(token, termA);
        this.checkNumber(token, termB);
        if (termA === termB)
          this.stack.push(1);
        else
          this.stack.push(0);
        break;

      case '!=':
        this.checkStackSize(token, 2);
        termA = this.stack.pop();
        termB = this.stack.pop();
        this.checkNumber(token, termA);
        this.checkNumber(token, termB);
        if (termA !== termB)
          this.stack.push(1);
        else
          this.stack.push(0);
        break;

      case '+':
        this.checkStackSize(token, 2);
        termA = this.stack.pop();
        termB = this.stack.pop();
        // this.print(`${termA} + ${termB} = ${termA + termB}`);
        this.stack.push(termA + termB);
        break;

      case '*':
        this.checkStackSize(token, 2);
        termA = this.stack.pop();
        termB = this.stack.pop();
        this.checkNumber(token, termA);
        this.checkNumber(token, termB);
        this.stack.push(termA * termB);
        break;

      case '/':
        this.checkStackSize(token, 2);
        termA = this.stack.pop();
        termB = this.stack.pop();
        this.checkNumber(token, termA);
        this.checkNumber(token, termB);
        this.stack.push(termA / termB);
        break;

      case '%':
        this.checkStackSize(token, 2);
        termA = this.stack.pop();
        termB = this.stack.pop();
        this.checkNumber(token, termA);
        this.checkNumber(token, termB);
        this.stack.push(termA % termB);
        break;

      case '-':
        this.checkStackSize(token, 2);
        termA = this.stack.pop();
        termB = this.stack.pop();
        this.checkNumber(token, termA);
        this.checkNumber(token, termB);
        this.stack.push(termA - termB);
        break;

      case '!':
        this.checkStackSize(token, 1);
        this.checkBools(token, 1);
        this.stack.push(1 - this.stack.pop());
        break;

      case '||':
        this.checkStackSize(token, 1);
        this.checkBools(token, 2);
        termA = this.stack.pop();
        termB = this.stack.pop();
        this.stack.push(termA || termB);
        break;

      case '&&':
        this.checkStackSize(token, 1);
        this.checkBools(token, 2);
        termA = this.stack.pop();
        termB = this.stack.pop();
        this.stack.push(termA && termB);
        break;

      default:
        // console.log(`Executing ${ word } program`);
        this.execOutput.push(`╔════════╗`);
        this.programs.push(word);
        this.execOutput.push(`${this.programs.slice(1)}: exec`);
        // TODO: executed refinements for empty programs
        let executed = this.interpret();
        if (!executed) {
          this.vm.error(token, `Word not found.`);
        }
        this.programs.pop();
        this.execOutput.push(`╚════════╝`);
        // this.execOutput.push(`end exec [${this.stack.slice().reverse().toString().padEnd(10, " ")}`);
        break;
    }
    return this.stack;
  }
  visitLABELtoken(token) {
  }
  visitSTRINGtoken(token) {
    // this.place(token, token.literal, 0);
    this.stack.push(token.literal);
    return this.stack;
  }
  visitNUMBERtoken(token) {
    // this.place(token, token.literal, 0);
    this.stack.push(token.literal);
    return this.stack;
  }
  visitNULLtoken(token) {
    // this.place(token, token.literal, 0);
    this.stack.push(token.literal);
    return this.stack;
  }
  visitWHITESPACEtoken(token) { }
  visitNEWLINEtoken(token) { }
  visitCOMMENTtoken(token) { }
  visitEOFtoken(token) { }

  top(token, n) {
    if (n < 0) {
      this.checkStackSize(token, Math.abs(n));
      return this.stack[-n - 1];
    } else if (n >= 0) {
      this.checkStackSize(token, n + 1);
      return this.stack[this.stack.length - n - 1];
    }
  }

  delete(token, n) {
    if (n < 0) {
      this.checkStackSize(token, Math.abs(n));
      this.stack.splice(-n - 1, 1);
    } else if (n >= 0) {
      this.checkStackSize(token, n + 1);
      this.stack.splice(this.stack.length - n - 1, 1);
    }
  }

  place(token, element, where) {
    this.checkStackSize(token, where);
    // this.print(where);
    this.checkInt(token, where);
    if (where >= 0) {
      this.stack.splice(this.stack.length - where, 0, element);
    } else {
      this.stack.splice(-1 - where, 0, element);

    }
  }

  print(msg) {
    this.vm.consoleText.push(msg);
  }

  checkBools(token, n = 0) {
    // check 0 or 1
    for (let i = 0; i < n; i++) {
      if ([1, 0].indexOf(this.top(token, i)) === -1) {
        let value = this.top(token, i);
        throw { token, message: `Must have bool operand. Found: ${value} of type ${typeof value}` };
      }
    }
  };
  checkStackSize(token, n = 0) {
    if (this.stack.length < n)
      throw { token, message: `Insufficient stack size: ${n}.` };
  };
  checkNumber(token, term) {
    if (!(!isNaN(parseFloat(term)) && isFinite(term))) {
      throw { token, message: `${term} is not a number.` };
    }
  };
  checkInt(token, term) {
    if (!(Number.isInteger(term))) {
      throw { token, message: `${term} is not an integer.` };
    }
  };
};

export default Interpreter;;;