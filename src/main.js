import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import { Expr } from './Expr';
import Pylox from "./Pylox";
import AstPrinter from "./AstPrinter";
createApp(App).mount('#app');

let pylox = new Pylox();
let tokens = pylox.tokens(`
    2.4 -5
    null
    if
    let X _h3ll
    `);

let pt = pylox.tokens;
console.log(tokens);
let parens = (new AstPrinter()).parenthesise(new Expr.Unary(tokens[1], tokens[2]));
console.log(parens);