<template>
  <div>
    <select v-bind="$attrs" v-on="$listeners">
      <option v-for="option in options.options" :key="option">{{ option }}</option>
    </select>
  </div>
</template>

<script>
import Vue from 'vue'

export default Vue.extend({
  props: {
    options: {
      type: Object,
      required: true,
    },
  },
})
</script>
