# Pylox

- An ugly language that loves you <3

program = expression*

expression = unary | startlabel expression* endlabel
startlabel = :word 
endlabel = ;word 

unary = ("!") unary
      | primary

primary = STRING | NUMBER | word | "null"



?jump ; C A B]
jump ; L]


@ ; => 2 0 1] => 0 2]
1 @ ; => 2 0] => 0 2]
swap ; A B] => B A]
swap ; => @0 @1]

nondestruct
log vs _log
@1 @2 _+

label
3.14 #pi

square: 
@0 dup *
; @0^2]
:square

3 "pie" 4 square "square" exec

operation
  initial stack
  after stack