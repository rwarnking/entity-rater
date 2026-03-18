import {createPinia} from 'pinia';
/**
 * plugins/index.ts
 *
 * Automatically included in `./src/main.ts`
 */

// Types
import type { App } from 'vue'

// Plugins
import vuetify from './vuetify'
import Toast from "vue-toastification";

// Styles
import "vue-toastification/dist/index.css";

export function registerPlugins (app: App) {
 app
    .use(vuetify)
    .use(createPinia())
    .use(Toast, { timeout: 3000 })
}