import { fileURLToPath, URL } from 'node:url'
import Vue from '@vitejs/plugin-vue'
import Fonts from 'unplugin-fonts/vite'
import { defineConfig } from 'vite'
import Vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'

import {
  GITHUB_REPO,
  GITHUB_USER,
  GITHUB_ITEM_PATH,
  GITHUB_RATING_PATH,
  GITHUB_USER_PATH,
} from "./secrets.config"

// https://vitejs.dev/config/
export default defineConfig({
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
    '__GITHUB_REPO__': JSON.stringify(GITHUB_REPO),
    '__GITHUB_USER__': JSON.stringify(GITHUB_USER),
    '__GITHUB_ITEM_PATH__': JSON.stringify(GITHUB_ITEM_PATH),
    '__GITHUB_USER_PATH__': JSON.stringify(GITHUB_USER_PATH),
    '__GITHUB_RATING_PATH__': JSON.stringify(GITHUB_RATING_PATH),
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
