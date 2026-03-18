import { fileURLToPath, URL } from 'node:url'
import Vue from '@vitejs/plugin-vue'
import Fonts from 'unplugin-fonts/vite'
import { defineConfig } from 'vite'
import Vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'

export const BASE_PATH = "/entity-rater/"

// https://vitejs.dev/config/
export default defineConfig({
  base: BASE_PATH,
  plugins: [
    Vue({
      template: { transformAssetUrls },
    }),
    // https://github.com/vuetifyjs/vuetify-loader/tree/master/packages/vite-plugin#readme
    Vuetify({
      autoImport: true,
      styles: {
        configFile: 'src/styles/settings.scss',
      },
    }),
    Fonts({
      fontsource: {
        families: [
          {
            name: 'Roboto',
            weights: [100, 300, 400, 500, 700, 900],
            styles: ['normal', 'italic'],
          },
        ],
      },
    }),
  ],
  define: {
    'process.env': {},
    "__APP_BASE_PATH__": JSON.stringify(BASE_PATH),
    "__GITHUB_REPO__": JSON.stringify("names-rating-data"),
    "__GITHUB_USER__": JSON.stringify("rwarnking"),
    "__GITHUB_DATA_ITEMS__": JSON.stringify("items"),
    "__GITHUB_DATA_USERS__": JSON.stringify("users"),
    "__GITHUB_DATA_RATINGS__": JSON.stringify("ratings"),
    "__GITHUB_DATA_CATEGORIES__": JSON.stringify("categories")
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('src', import.meta.url)),
    },
    extensions: [
      '.js',
      '.json',
      '.jsx',
      '.mjs',
      '.ts',
      '.tsx',
      '.vue',
    ],
  },
  server: {
    port: 3000,
  },
})
