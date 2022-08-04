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
      this.interpret()
    },
    interpret() {
      this.pylox = new Pylox()
      this.pylox.interpret(this.code)
      this.stackText = `[${this.pylox.interpreter.stack.reverse().join(',')}`
      this.consoleText = `${this.pylox.consoleText}`
    },
  },
  mounted: function () {
    let minusTest = `-1 - 2 --3 - - 4 -2a - b`
    let preBang = `!1 ! 2 !!3 ! ! 4 !a ! b !2c`
    let postBang = `1! 2 ! 3!! ! 4 ! a! b ! 2c! `
    let tildeTest = `2 2 +`
    let prog = `
sq:
dup *
sq;
4 sq`
    this.code = prog
    // console.log(this.pylox.parse(this.code))
    // this.interpret()
    // this.$emit('input')
    // console.log('mounted')
  },
}

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
    <textarea
      spellcheck="false"
      class="code-area code-text aside"
      v-model="code"
      @input.prevent="inputtedCode"
    ></textarea>
    <aside class="content stack-view code-text">
      {{ stackText }}
    </aside>
    <footer class="footer console-view code-text">
      <span class="">Console: {{ consoleText }}</span>
    </footer>
  </div>
</template>

<style scoped>
.code-text {
  font-size: 16px;
  line-height: 24px;
  font-weight: 400;
  font-family: monospace;

  box-sizing: border-box;
}
.wrapper {
  display: grid;
  grid-template-columns: 300px 600px;

  grid-template-rows: 300px 300px;
  grid-template-areas:
    'aside content'
    'footer footer';
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
