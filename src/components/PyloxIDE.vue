<script>
import Pylox from '../Pylox'

export default {
  name: 'app',
  data() {
    return {
      code: 'a b c d e -1 @',
      consoleText: 'testConsole',
      stackText: 'testStack',
      pylox: new Pylox(),
    }
  },
  methods: {
    inputtedCode(e) {
      // this.$root.$emit('input', e.target.innerHTML)
      this.runCode()
    },
    runCode() {
      this.pylox = new Pylox()
      this.pylox.run(this.code)
      this.stackText = `[${this.pylox.interpreter.stack
        .slice()
        .reverse()
        .join(',')}`
      this.consoleText = `${this.pylox.consoleText}`
      console.log(this.pylox.interpreter.stack)
    },
  },
  mounted: function () {
    this.code = `double:
2 *
double;

pi: 3.14 pi;

pi double
`
    console.log(this.pylox.parse(this.code))
    this.runCode()
    console.log(this.debugText)
    // this.$emit('input')
    // console.log('mounted')
  },
}

let minusTest = `-1 - 2 --3 - - 4 -2a - b`
let preBang = `!1 ! 2 !!3 ! ! 4 !a ! b !2c`
let postBang = `1! 2 ! 3!! ! 4 ! a! b ! 2c! `
let tildeTest = `2 2 +`
let prog = `
count:
dup 1 + dup
10 >
1 "count" put
2 "done" put
?exec
print
count;

done:
done;
0 count 
`
let subProgTest = `0 a: 1 b: 2 b; 3 a; 4 a b`
// [2,3,2,1,4,0

// let pylox = new Pylox()
// pylox.run(subProgTest)
// let tokens = pylox.tokens(`
// @ 4
// sq1:
// sq1;
// 1 2
// `);
// 1 2
//     : square;
// dup *
//     ; square

// let tokens = pylox.tokenise(source)
// let tree = pylox.parse(source)
// console.log(tokens)
// console.log(tree)
</script>
<template>
  <div class="wrapper">
    <div class="deb code-text">
      <p class="debug-output" v-for="output in pylox.interpreter.execOutput">
        <pre>{{ output }}</pre>
      </p>
    </div>
    <textarea
      spellcheck="false"
      class="code-area code-text aside"
      v-model="code"
      @input.prevent="inputtedCode"
    ></textarea>
    <div class="content stack-view code-text">
      {{ stackText }}
    </div>
    <div class="footer console-view code-text">
      <span class="">Console: {{ consoleText }}</span>
    </div>
  </div>
</template>

<style scoped>
.debug-output {
  line-height: 16px;
  padding: 0px;
  margin: 0px;
}
.code-text {
  font-size: 16px;
  line-height: 24px;
  font-weight: 400;
  font-family: monospace;

  box-sizing: border-box;
}
.wrapper {
  display: grid;
  grid-template-columns: 600px 300px 500px;

  grid-template-rows: 300px 300px;
  grid-template-areas:
    'deb aside content'
    'deb footer footer';
  grid-gap: 15px;
}
.code-area {
  grid-area: aside;
}

.stack-view {
  margin: 0px;
  background-color: #111;
  grid-area: content;
}
.console-view {
  grid-area: footer;
}
</style>
