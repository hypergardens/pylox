function literalPrint(tokens, height = 15, width = 20) {
  let text = ["===="];
  text.push(tokens.map(e => e.lexeme).join(""));
  text.push("====");
  return text.join('');
}

export default literalPrint; 