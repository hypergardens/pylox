# Stox

- An ugly language that can do anything!

## References

- https://codemirror.net/

program = token* EOF

## TODO

unescape \s function
lump log
  getInlinedOperations
    if comment followed by newline
    get all operations on this line
    take depth into account and reset yOff and xOff
ignore whitespace at end of line
code load
code colour

refactor so that getMacroTokens and stringToTokens operate on the same core

add depth checking to stackOperations
make stack ops collapse if they encounter a comment
  all are collapsed that have parents on this depth