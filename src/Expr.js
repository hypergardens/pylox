// import Token from './Token';

class Base {
  accept(visitor) {
    throw 'Not implemented!';
  }
}

class Unary extends Base {
  constructor(operator, right) {
    super();
    this.operator = operator;
    this.right = right;
    this.type = "Unary";
  }
  accept(visitor) {
    return visitor.visitUnaryExpr(this);
  }
}
class Literal extends Base {
  constructor(value) {
    super();
    this.value = value;
    this.type = "Literal";
  }
  accept(visitor) {
    return visitor.visitLiteralExpr(this);
  }
}

// class Program extends Base {
//   constructor(label) {
//     this.label = label;
//     this.type = "Literal";
//   }
//   accept(visitor) {
//     return visitor.visitProgramExpr(this);
//   }
// }

export const Expr = {
  Base, Unary, Literal, //Program
};