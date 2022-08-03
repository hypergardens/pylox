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
    1 2
    :square
    dup *
    ;square

    !odd !0 4 -3 square
    `);

let pt = pylox.tokens;
let tree = new Parser(tokens).program();
let parens = (new AstPrinter()).parenthesise(tree);
console.log(tokens);
console.log(parens);