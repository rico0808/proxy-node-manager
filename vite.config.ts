import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import hooks from "@midwayjs/vite-plugin-hooks";
import ViteComponents, { AntDesignVueResolver } from "vite-plugin-components";

import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";

// https://vitejs.dev/config/
export default defineConfig({
  css: {
    postcss: {
      plugins: [tailwindcss, autoprefixer],
    },
  },
  plugins: [
    hooks(),
    vue(),
    ViteComponents({
      customComponentResolvers: [AntDesignVueResolver()],
    }),
  ],
});
