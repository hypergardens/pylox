import { TokenTypes } from "./TokenTypes";
class Interpreter {
  constructor(vm) {
    TokenTypes.canVisitTokens(this);
    this.vm = vm;

    this.tokens = [];
    this.stack = [];
    this.ignoring = {};
  }
  loadTokens(tokens) {
    this.tokens = tokens;
  }
  interpret(program = null) {
    try {
      for (let token of this.tokens) {
        if (program === null && token.programs.length === 0) {
          // console.log(`Accepting token |${token.programs}-->${token.lexeme}|`);
          token.accept(this);
        } else if (program !== null && token.programs.indexOf(program) !== -1) {
          // console.log(`Accepting token |${token.programs}-->${token.lexeme}|`);
          token.accept(this);
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
        console.log(`term B ${termB}`);
        this.stack.push(termB);
        break;
      case 'dup':
        this.checkStackSize(token, 1);
        let value = this.stack.pop();
        this.stack.push(value, value);
        break;

      case '+':
        this.checkStackSize(token, 2);
        termA = this.stack.pop();
        termB = this.stack.pop();
        this.stack.push(termA + termB);
        break;

      case '*':
        this.checkStackSize(token, 2);
        termA = this.stack.pop();
        termB = this.stack.pop();
        this.stack.push(termA * termB);
        break;

      case '!':
        this.checkStackSize(token, 1);
        this.checkBools(token, 1);
        this.stack.push(1 - this.stack.pop());
        break;

      default:
        // console.log(`Executing ${word} program`);
        this.interpret(word);
        break;
    }
    return this.stack;
  }
  visitLABELtoken(token) {
    // this.stack.push(token.value);
    // let lexeme = token.lexeme;
    // if (lexeme[lexeme.length - 1] === `:`) {
    //   let label = lexeme.slice(0, lexeme.length - 1);
    //   // label:
    //   if (this.execCell().label !== label) {
    //     console.log(`new, label ${label}, ignoring`);
    //     this.ignoring[label] = true;
    //   }
    //   // exec till label;
    // } else if (lexeme[lexeme.length - 1] === `;`) {
    //   let label = lexeme.slice(0, lexeme.length - 1);
    //   console.log(`finished label ${label} ${this.isIgnoring(label)}`);

    //   this.ignoring[label] = false;
    // } else {
    //   this.stack.push(`${lexeme}$`);
    //   console.error("I don't know what's going on but this is where it is.");
    // }
    // return this.stack;
  }
  visitSTRINGtoken(token) {
    this.stack.push(token.literal);
    return this.stack;
  }
  visitNUMBERtoken(token) {
    this.stack.push(token.literal);
    return this.stack;
  }
  visitNULLtoken(token) {
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

  pluck(n) {

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