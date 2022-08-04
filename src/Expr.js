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

class Word extends Base {
  constructor(value) {
    super();
    this.value = value;
    this.type = "Word";
  }
  accept(visitor) {
    return visitor.visitWordExpr(this);
  }
}
export const Expr = {
  Base, Unary, Literal, Word//, Program
};