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
      this.stackText = `${this.pylox.interpreter.stack.join(',')}`
      this.consoleText = `${this.pylox.consoleText}`
    },
    created() {
      let minusTest = `-1 - 2 --3 - - 4 -2a - b`
      let preBang = `!1 ! 2 !!3 ! ! 4 !a ! b !2c`
      let postBang = `1! 2 ! 3!! ! 4 ! a! b ! 2c! `
      let tildeTest = `2 2 +`
      let prog = `
          sq:
          dup *
          sq;
          4 sq`
    },
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
    <aside class="aside">
      <p class="stack-view code-text">Output: {{ stackText }}</p>
    </aside>
    <div class="content">
      <textarea
        spellcheck="false"
        class="code-area code-text"
        v-model="code"
        @input.prevent="inputtedCode"
      ></textarea>
    </div>
    <footer class="footer">
      <p class="console-view code-text">Console: {{ consoleText }}</p>
    </footer>
  </div>
</template>

<style scoped>
.code-text {
  font-size: 16px;
  line-height: 24px;
  font-weight: 400;
  font-family: monospace;
}
.wrapper {
  display: grid;
  grid-template-columns: 600px 300px;

  grid-template-rows: 300px 300px;
  grid-template-areas:
    'aside content'
    'footer footer';
  grid-gap: 15px;
}
.code-area {
  /* width: 300px; */
  height: 200px;
  display: inline-block;
  grid-area: content;
}

.stack-view {
  /* width: 600px; */
  height: 200px;
  background-color: #111;
  grid-area: aside;
}
.console-view {
  /* width: 600px; */
  height: 200px;
  display: inline-block;
  grid-area: footer;
}
</style>
