import TreeVisitor from "./TreeVisitor";
import { Expr } from "./Expr";
import Token from "./Token";
class AstPrinter extends TreeVisitor {
  constructor() {
    super();
  }
  parenthesise(...args) {
    let strArr = [];
    strArr.push("(");
    for (let i = 0; i < args.length; i++) {
      if (i > 0) strArr.push(" ");
      let arg = args[i];
      // arg is string
      console.log({ arg });
      if (Array.isArray(arg)) {
        // HACK: split array into units recursively
        strArr.push(this.parenthesise(...arg));
      } else if (typeof arg === 'string') {
        // arg is string
        strArr.push(arg);
      } else if (arg instanceof Expr.Base) {
        // arg is expr
        strArr.push(arg.accept(this));
      }
      else if (arg instanceof Token) {
        // arg is token
        console.log("Token Parenth");
        // HACK: should probably use a proper expression
        // console.log(arg);
        strArr.push(arg.lexeme);
      }
    }
    strArr.push(')');
    return strArr.join('');
  }

  visitUnaryExpr(expr) {
    console.log("Unary parenth");
    return this.parenthesise(expr.operator, expr.right);
  }

  visitLiteralExpr(expr) {
    if (expr.value == null) return "NULL";
    return expr.value.toString();
  }
  // visitProgramExpr(expr) {
  // if (expr.value == null) return "NULL";
  // return expr.value.toString();
  // }
}

export default AstPrinter; 