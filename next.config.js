/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Ignorar errores de ESLint durante el build en producción
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Ignorar errores de TypeScript durante el build en producción  
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig