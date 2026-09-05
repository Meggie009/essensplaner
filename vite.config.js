import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

// IMPORTANT: replace 'meal-planner' with your actual GitHub repo name.
// This must match https://<username>.github.io/<repo-name>/
export default defineConfig({
  plugins: [svelte()],
  base: '/meal-planner/',
});
