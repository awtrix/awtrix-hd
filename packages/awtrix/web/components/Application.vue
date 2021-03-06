<template>
  <div v-show="visible" class="w-full h-full">
    <component :is="appComponent" :app="app" :visible="visible" :io="io"
      v-on="$listeners"
    />
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { LifecycleApplication } from '@/types/Application'
import io, { Socket } from 'socket.io-client'
import { GeneratorType, FrontendApp } from '@awtrix/common'

// TODO: Figure out a better spot for this. Otherwise we need to use
// "--inline-vue" when building apps
// @ts-ignore
window.Vue = Vue

export default Vue.extend({
  props: {
    app: {
      type: Object as PropType<LifecycleApplication>,
      required: true,
    },
    visible: {
      type: Boolean,
      required: true,
    },
  },

  data () {
    return {
      io: undefined as typeof Socket | undefined,
    }
  },

  computed: {
    appComponent (): () => Promise<any> {
      if (this.app.id == 'boot') return () => import('./BootAnimation.vue')

      return () => this.importComponent(this.app.name, this.app.version!)
    },
  },

  watch: {
    app: {
      immediate: true,
      handler (app) {
        this.io = io(`http://${location.hostname}:3001/apps/${app.id}`)
      },
    },
  },

  methods: {
    async importComponent (name: string, version: string): Promise<ReturnType<GeneratorType>> {
      const componentKey = `AwtrixComponent.${name}`
      const url = `/static/apps/${name}/${version}/AwtrixComponent.${name}.umd.js`

      // This is to get around index errors when accessing unknown keys on
      // the global window object
      const castedWindow = window as any
      if (castedWindow[componentKey]) return castedWindow[componentKey]

      const generate: GeneratorType = await new Promise(async (resolve, reject) => {
        const script = document.createElement('script')
        script.async = true
        script.addEventListener('load', () => {
          resolve(castedWindow[componentKey])
        })
        script.addEventListener('error', () => {
          reject(new Error(`Error loading ${url}`))
        })
        script.src = url

        document.head.appendChild(script)
      })

      const generated = generate(FrontendApp)

      // Since `vue-loader` adds a compiled render function to the exported
      // object, but we're exporting a generator function, rather than the Vue
      // constructor, we need to now override the original render function with
      // the compiled one.
      // TODO: Object.assign doesn't work here, but find a better way than this!
      // @ts-ignore
      generated.options.render = generate.options.render
      // @ts-ignore
      generated.options.staticRenderFns = generate.options.staticRenderFns
      // @ts-ignore
      generated.options.__file = generate.options.__file

      return generated
    }
  }
})
</script>
