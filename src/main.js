import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import { Expr } from './Expr';
import Pylox from "./Pylox";
import AstPrinter from "./AstPrinter";
import Parser from "./Parser";
import literalPrint from './literalPrint';
import Scanner from './Scanner';
createApp(App).mount('#app');
let pylox = new Pylox();
// let tokens = pylox.tokens(`
// @ 4
// sq1:
// sq1;
// 1 2
// `);
let minusTest = `-1 - 2 --3 - - 4 -2a - b`;
let preBang = `!1 ! 2 !!3 ! ! 4 !a ! b !2c`;
let postBang = `1! 2 ! 3!! ! 4 ! a! b ! 2c! `;
let tildeTest = `2 4 + +`;
let source = tildeTest;
// 1 2
//     : square;
// dup *
//     ; square


let tokens = pylox.tokenise(source);
let tree = pylox.parse(source);
console.log(literalPrint(tokens));
let parens = (new AstPrinter()).parenthesise(tree);
console.log(tokens);
console.log(tree);
pylox.interpret(source);