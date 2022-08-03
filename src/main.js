import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import { Expr } from './Expr';
import Pylox from "./Pylox";
import AstPrinter from "./AstPrinter";
import Parser from "./Parser";

createApp(App).mount('#app');

let pylox = new Pylox();
let tokens = pylox.tokens(`
    4 !odd
    square:
    dup *
    SQ: AAA 
   
    square;
    1 2
    SQ;
    3 4
    `);


// 1 2
//     : square;
// dup *
//     ; square


let tree = new Parser(tokens).expressions();
let parens = (new AstPrinter()).parenthesise(tree);
console.log(tokens);
console.log(parens);