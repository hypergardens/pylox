<script>
import { Token } from '../Tokens'

export default {
  name: 'TokenView',
  props: {
    token: Token,
  },
  methods: {
    coordForm() {
      return `${this.token.lexeme}@${this.token.xOff},${this.token.yOff}`
    },
    logToConsole() {
      console.log(this.coordForm())
    },
  },
  computed: {
    newlineToken() {
      return this.token.type === 'NEWLINE'
    },
    stringToken() {
      return this.token.type === 'STRING'
    },
    wordToken() {
      return this.token.type === 'WORD'
    },
    labelToken() {
      return this.token.type === 'LABEL'
    },
    numberToken() {
      return this.token.type === 'NUMBER'
    },
    progLength() {
      // return '2px'
      return this.token.depth + 1 + 'px'
    },
  },
}
</script>
<template>
  <span
    @click="logToConsole"
    :class="{
      token: true,
      'string-token': stringToken,
      'word-token': wordToken,
      'label-token': labelToken,
      'number-token': numberToken,
      'newline-token': newlineToken,
    }"
    :style="{ 'border-width': progLength }"
    >{{ token.type === 'EOF' ? 'EOF' : token.lexeme }} <br v-if="newlineToken"
  /></span>
</template>
<style scoped>
.token {
  border: 1px solid;
  margin: 3px;
  padding: 3px;
  box-sizing: border-box;
  line-height: 35px;
}
.word-token {
  color: yellow;
}
.label-token {
  color: rgb(255, 152, 68);
}
.string-token {
  color: rgb(52, 218, 52);
}
.number-token {
  color: cyan;
}
.newline-token::before {
  content: N;
  color: white;
}
</style>
