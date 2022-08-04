import TreeVisitor from "./TreeVisitor";

class Interpreter extends TreeVisitor {
  constructor(vm) {
    super();
    this.vm = vm;

    this.stack = [];
  }
  interpret(expressions) {
    try {

      for (let i = 0; i < expressions.length; i++) {
        let expr = expressions[i];
        console.log(expr.accept(this));
      }
    } catch (error) {
      this.vm.error(error.token, error.message);
    }
  }
  visitLiteralExpr(expr) {
    this.stack.push(expr.value);
    return this.stack;
  }
  visitWordExpr(expr) {
    let op = expr.value;
    let word = expr.value.lexeme;
    if (word === `+`) {
      this.checkStackSize(op, 2);
      this.stack.push(this.stack.pop() + this.stack.pop());
    } else {
      this.stack.push(`${word}$`);
    }
    return this.stack;
  }

  checkStackSize(token, n = 0) {
    if (this.stack.length < n)
      throw { token, message: `Insufficient stack size: ${n}.` };
  };
};

export default Interpreter;;