import os

path = "c:\\Users\\Oleksandr\\fridge-fresh-planner-main\\fridge-fresh-planner-main\\vite.config.ts"

with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

if 'VitePWA' not in text:
    text = text.replace('import { componentTagger } from "lovable-tagger";', 'import { componentTagger } from "lovable-tagger";\nimport { VitePWA } from "vite-plugin-pwa";')
    
    old_plugins = 'plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),'
    new_plugins = """plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: "prompt",
      includeAssets: ["favicon.ico", "apple-touch-icon.png", "masked-icon.svg"],
      manifest: {
        name: "Neld - Трекер продуктов",
        short_name: "Neld",
        description: "Умный трекер свежести продуктов",
        theme_color: "#ffffff",
        background_color: "#ffffff",
        display: "standalone",
        icons: [
          {
            src: "/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 4000000,
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
      },
    }),
  ].filter(Boolean),"""
    text = text.replace(old_plugins, new_plugins)

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)

print("vite.config.ts configured for PWA!")
