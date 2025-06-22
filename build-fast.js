import { build } from 'vite'
import path from 'path'

async function fastBuild() {
  try {
    console.log('Starting fast production build...')
    
    await build({
      build: {
        outDir: 'dist/client',
        emptyOutDir: true,
        minify: true,
        rollupOptions: {
          output: {
            manualChunks: {
              vendor: ['react', 'react-dom'],
              query: ['@tanstack/react-query'],
              ui: ['@radix-ui/react-dialog']
            }
          }
        }
      },
      resolve: {
        alias: {
          '@': path.resolve(process.cwd(), './client/src'),
          '@lib': path.resolve(process.cwd(), './client/src/lib'),
          '@components': path.resolve(process.cwd(), './client/src/components'),
          '@pages': path.resolve(process.cwd(), './client/src/pages'),
          '@hooks': path.resolve(process.cwd(), './client/src/hooks'),
          '@assets': path.resolve(process.cwd(), './attached_assets')
        }
      },
      root: './client',
      optimizeDeps: {
        include: ['react', 'react-dom'],
        exclude: ['@vite/client']
      }
    })
    
    console.log('✅ Fast build completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Build failed:', error.message)
    process.exit(1)
  }
}

fastBuild()