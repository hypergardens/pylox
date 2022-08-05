let types = [`WORD`, `LABEL`, `STRING`, `NUMBER`,
  `NULL`, `WHITESPACE`, `NEWLINE`, `COMMENT`,
  `EOF`];

function canVisitTokens(obj) {
  types.forEach(type => {
    if (!obj[`visit${type}token`])
      console.error(`Unimplemented token type in ${obj.constructor.name}.visit${type}token(): ${type}`);
  });
}

export const TokenTypes = {
  types, canVisitTokens
};