import TreeVisitor from "./TreeVisitor";

class Interpreter extends TreeVisitor {
  constructor(vm) {
    super();
    this.vm = vm;

    this.expressions = [];
    this.stack = [];
    this.execStack = [{ ptr: 0, label: "main" }];
    this.ignoring = {
      "main": false
    };
  }
  interpret(expressions) {
    this.expressions = expressions;
    try {
      while (this.ptr() < this.expressions.length) {

        let expr = this.expressions[this.ptr()];
        console.log(expr.accept(this));
        this.advance();
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
  visitLiteralExpr(expr) {
    this.stack.push(expr.value);
    return this.stack;
  }
  visitWordExpr(expr) {
    let token = expr.value;
    let word = expr.value.lexeme;
    let termA, termB, termC;
    switch (word) {
      case '@':
        this.checkStackSize(token, 1);
        termA = this.stack.pop();
        this.checkNumber(token, termA);
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
        if (word[word.length - 1] === `:`) {
          let label = word.slice(0, word.length - 1);
          // label:
          if (this.execCell().label !== label) {
            console.log(`new, label ${label}, ignoring`);
            this.ignoring[label] = true;
          }
          // exec till label;
        }
        this.stack.push(`${word}$`);
        break;
    }
    return this.stack;
  }
  execCell() {
    return this.execStack[0];
  }
  ptr() {
    return this.execCell().ptr;
  }

  advance() {
    this.execCell().ptr++;
    return;
  }

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
};

export default Interpreter;;