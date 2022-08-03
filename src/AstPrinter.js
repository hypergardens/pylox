import TreeVisitor from './TreeVisitor';
import { Expr } from './Expr';
import Token from './Token';
class AstPrinter extends TreeVisitor {
  constructor() {
    super();
  }
  parenthesise(...args) {
    let strArr = [];
    for (let i = 0; i < args.length; i++) {
      if (i > 0) strArr.push(' ');
      let arg = args[i];
      // arg is string
      console.log({ arg });
      if (Array.isArray(arg)) {
        // strArr.push('(');
        // HACK: split array into units recursively
        strArr.push(this.parenthesise(...arg));
        // strArr.push(')');
      } else if (typeof arg === 'string' || typeof arg === 'number') {
        // arg is string
        strArr.push(arg);
      } else if (arg instanceof Expr.Base) {
        // arg is expr
        strArr.push(arg.accept(this));
      }
      else if (arg instanceof Token) {
        // arg is token
        // HACK: should probably use a proper expression
        // console.log(arg);
        strArr.push(arg.lexeme);
      }
    }
    return strArr.join('');
  }

  visitUnaryExpr(expr) {
    console.log('Unary parenth');
    return this.parenthesise("(", expr.operator, expr.right, ")");
  }

  visitLiteralExpr(expr) {
    if (expr.value == null) return 'NULL';
    console.log(`Value ${expr.value}`);
    return this.parenthesise(expr.value);
  }

  visitWordExpr(expr) {
    return this.parenthesise(expr.value);
  }
  // visitProgramExpr(expr) {
  // if (expr.value == null) return 'NULL';
  // return expr.value.toString();
  // }
}

export default AstPrinter; 