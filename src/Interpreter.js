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
    switch (word) {
      case 'dup':
        this.checkStackSize(token, 1);
        let value = this.stack.pop();
        this.stack.push(value, value);
        break;

      case '+':
        this.checkStackSize(token, 2);
        this.stack.push(this.stack.pop() + this.stack.pop());
        break;

      case '*':
        this.checkStackSize(token, 2);
        this.stack.push(this.stack.pop() * this.stack.pop());
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

  top(n) {
    if (this.stack.length < Math.abs(n)) {
      console.log(`Stack too small.`);
    } else if (n >= 0) {
      return this.stack[0];
    } else {
      return this.stack[this.stack.length - n - 1];
    }
  }

  pluck(n) {

  }

  checkBools(token, n = 0) {
    // check 0 or 1
    for (let i = 0; i < n; i++) {
      if ([1, 0].indexOf(this.top(i)) === -1)
        throw { token, message: `Must have bool operand. Found: ${this.top(i)}` };
    }
  };
  checkStackSize(token, n = 0) {
    if (this.stack.length < n)
      throw { token, message: `Insufficient stack size: ${n}.` };
  };
};

export default Interpreter;;