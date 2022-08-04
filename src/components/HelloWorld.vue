<script>
import Pylox from '../Pylox'

export default {
  name: 'app',
  data() {
    return {
      code: 'testCode',
      consoleText: 'testConsole',
      pylox: new Pylox(),
    }
  },
  methods: {
    inputtedCode(e) {
      // this.$root.$emit('input', e.target.innerHTML)
      this.pylox.interpret(this.code)
      this.consoleText = this.pylox.interpreter.stack
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
  <div style="display: flex">
    <p class="code-console code-text">Output: {{ consoleText }}</p>
    <textarea
      spellcheck="false"
      class="code-area code-text"
      v-model="code"
      @input.prevent="inputtedCode"
    ></textarea>
  </div>
</template>

<style scoped>
.code-text {
  font-size: 16px;
  line-height: 24px;
  font-weight: 400;
  font-family: monospace;
}
.code-area {
  width: 300px;
  height: 200px;
  display: inline-block;
}

.code-console {
  width: 600px;
  height: 200px;
  display: inline-block;
}
</style>
