import TreeVisitor from './TreeVisitor';
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
      if (Array.isArray(arg)) {
        // strArr.push('(');
        // HACK: split array into units recursively
        strArr.push(this.parenthesise(...arg));
        // strArr.push(')');
      } else if (typeof arg === 'string' || typeof arg === 'number') {
        // arg is string
        strArr.push(arg);
      }
      else if (arg instanceof Token) {
        // arg is token
        // HACK: should probably use a proper expression
        strArr.push(`${arg.lexeme}`);
      }
    }
    return strArr.join('');
  }

  visitLiteralToken(token) {
    if (token.value == null) return 'NULL';
    // console.log(`Value ${token.value}`);
    return this.parenthesise(token.value);
  }

  visitWordToken(token) {
    return this.parenthesise(token.lexeme);
  }
  // visitProgramExpr(expr) {
  //   // if (expr.token == null) return 'NULL';
  //   return this.parenthesise(`${expr.name}[`, expr.expressions, `]${expr.name}`);
  // }
}

export default AstPrinter; 