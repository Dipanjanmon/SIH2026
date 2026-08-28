import react from '@vitejs/plugin-react'
<<<<<<< HEAD
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

=======
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
>>>>>>> 75c08c974147a000c352e1c4f8528ef5332f1bfe
export default defineConfig({
  plugins: [react(), tailwindcss()],
})
