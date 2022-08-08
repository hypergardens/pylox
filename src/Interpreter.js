import { TokenTypes } from "./TokenTypes";
import Token from "./Token";

class Interpreter {
  constructor(vm) {
    TokenTypes.canVisitTokens(this);
    this.vm = vm;

    this.tokens = [];
    this.stack = [];
    this.ignoring = {};
    this.ptr = 0;
    this.execOutput = [];
  }
  loadTokens(tokens) {
    this.tokens.push(...tokens);
  }
  interpret(program = null) {
    let executed = false;
    try {
      for (let i = 0; i < this.tokens.length; i++) {
        let token = this.tokens[i];
        if (program === null && token.programs.length === 0 ||
          program !== null && token.programs.indexOf(program) !== -1) {
          // main program or specific program token

          // console.log(`Accepting token |${token.programs}-->${token.lexeme}|`);
          this.ptr = i;
          token.accept(this);
          if (["WHITESPACE", "NEWLINE", "LABEL"].indexOf(token.type) === -1) {
            this.execOutput.push(`${token.lexeme.padStart(8, " ")} → [${this.stack.slice().reverse().toString().padEnd(10, " ")}`);
          }
          executed = true;
        } else {
          // console.log(`Skipping token |${token.programs}-->${token.lexeme}|`);
        }
      }
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
  isIgnoring(label = null) {
    if (label === null) {
      for (let label of this.ignoring) {
        if (this.ignoring === true) {
          return true;
        }
      }
    } else {
      return (this.ignoring[label]);
    }
  }

  visitWORDtoken(token) {
    let word = token.lexeme;
    let termA, termB, termC;
    switch (word) {
      case '@':
        this.checkStackSize(token, 1);
        termA = this.stack.pop();
        this.checkInt(token, termA);
        this.checkStackSize(token, termA);
        termB = this.top(token, termA);
        termB = this.delete(token, termA);
        this.stack.push(termB);
        break;

      case 'exec':
        this.checkStackSize(token, 1);
        termA = this.stack.pop();
        this.visitWORDtoken({ lexeme: termA });
        break;

      case '?exec':
        this.checkStackSize(token, 3);
        termA = this.stack.pop();
        termB = this.stack.pop();
        termC = this.stack.pop();
        if (termA === 0) {
          // this.print(`?exec : ${termB}`);
          this.visitWORDtoken({ lexeme: termB });
        } else {
          // this.print(`?exec : ${termC}`);
          this.visitWORDtoken({ lexeme: termC });
        }
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
        termB = this.delete(token, termA);
        break;

      case 'put':
        this.checkStackSize(token, 2);
        termA = this.stack.pop();
        termB = this.stack.pop();
        this.place(token, termA, termB);
        // termB = this.delete(token, termA);
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

      default:
        // console.log(`Executing ${word} program`);
        this.execOutput.push(`____`);
        this.execOutput.push(`${token.lexeme}: exec`);

        let executed = this.interpret(word);
        if (!executed) {
          this.vm.error(token, `Word not found.`);
        }
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
      return this.stack.splice(-n - 1, 1);
    } else if (n >= 0) {
      this.checkStackSize(token, n + 1);
      return this.stack.splice(this.stack.length - n - 1, 1);
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
      if ([1, 0].indexOf(this.top(i)) === -1)
        throw { token, message: `Must have bool operand. Found: ${this.top(token, i)}` };
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

export default Interpreter;;