// vite.config.ts
import { vitePlugin as remix } from "file:///D:/flyio/remix-vite-template/node_modules/@remix-run/dev/dist/index.js";
import morgan from "file:///D:/flyio/remix-vite-template/node_modules/morgan/index.js";
import { remixDevTools } from "file:///D:/flyio/remix-vite-template/node_modules/remix-development-tools/dist/vite.js";
import { flatRoutes } from "file:///D:/flyio/remix-vite-template/node_modules/remix-flat-routes/dist/index.js";
import { defineConfig } from "file:///D:/flyio/remix-vite-template/node_modules/vite/dist/node/index.js";
import tsconfigPaths from "file:///D:/flyio/remix-vite-template/node_modules/vite-tsconfig-paths/dist/index.mjs";
var vite_config_default = defineConfig({
  build: { manifest: true },
  plugins: [
    morganPlugin(),
    remixDevTools(),
    tsconfigPaths(),
    remix({
      ignoredRouteFiles: ["**/*"],
      serverModuleFormat: "esm",
      routes: async (defineRoutes) => {
        return flatRoutes("routes", defineRoutes, {
          ignoredRouteFiles: ["**/*.test.{js,jsx,ts,tsx}", "**/__*.*"]
        });
      }
    })
  ]
});
function morganPlugin() {
  return {
    name: "morgan-plugin",
    configureServer(server) {
      return () => {
        server.middlewares.use(morgan("tiny"));
      };
    }
  };
}
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxmbHlpb1xcXFxyZW1peC12aXRlLXRlbXBsYXRlXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFxmbHlpb1xcXFxyZW1peC12aXRlLXRlbXBsYXRlXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi9mbHlpby9yZW1peC12aXRlLXRlbXBsYXRlL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgdml0ZVBsdWdpbiBhcyByZW1peCB9IGZyb20gJ0ByZW1peC1ydW4vZGV2J1xyXG5pbXBvcnQgbW9yZ2FuIGZyb20gJ21vcmdhbidcclxuaW1wb3J0IHsgcmVtaXhEZXZUb29scyB9IGZyb20gJ3JlbWl4LWRldmVsb3BtZW50LXRvb2xzL3ZpdGUnXHJcbmltcG9ydCB7IGZsYXRSb3V0ZXMgfSBmcm9tICdyZW1peC1mbGF0LXJvdXRlcydcclxuaW1wb3J0IHsgZGVmaW5lQ29uZmlnLCB0eXBlIFZpdGVEZXZTZXJ2ZXIgfSBmcm9tICd2aXRlJ1xyXG5pbXBvcnQgdHNjb25maWdQYXRocyBmcm9tICd2aXRlLXRzY29uZmlnLXBhdGhzJ1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcclxuICBidWlsZDogeyBtYW5pZmVzdDogdHJ1ZSB9LFxyXG4gIHBsdWdpbnM6IFtcclxuICAgIG1vcmdhblBsdWdpbigpLFxyXG4gICAgcmVtaXhEZXZUb29scygpLFxyXG4gICAgdHNjb25maWdQYXRocygpLFxyXG4gICAgcmVtaXgoe1xyXG4gICAgICBpZ25vcmVkUm91dGVGaWxlczogWycqKi8qJ10sXHJcbiAgICAgIHNlcnZlck1vZHVsZUZvcm1hdDogJ2VzbScsXHJcbiAgICAgIHJvdXRlczogYXN5bmMgZGVmaW5lUm91dGVzID0+IHtcclxuICAgICAgICByZXR1cm4gZmxhdFJvdXRlcygncm91dGVzJywgZGVmaW5lUm91dGVzLCB7XHJcbiAgICAgICAgICBpZ25vcmVkUm91dGVGaWxlczogWycqKi8qLnRlc3Que2pzLGpzeCx0cyx0c3h9JywgJyoqL19fKi4qJ10sXHJcbiAgICAgICAgfSlcclxuICAgICAgfSxcclxuICAgIH0pLFxyXG4gIF0sXHJcbn0pXHJcblxyXG5mdW5jdGlvbiBtb3JnYW5QbHVnaW4oKSB7XHJcbiAgcmV0dXJuIHtcclxuICAgIG5hbWU6ICdtb3JnYW4tcGx1Z2luJyxcclxuICAgIGNvbmZpZ3VyZVNlcnZlcihzZXJ2ZXI6IFZpdGVEZXZTZXJ2ZXIpIHtcclxuICAgICAgcmV0dXJuICgpID0+IHtcclxuICAgICAgICBzZXJ2ZXIubWlkZGxld2FyZXMudXNlKG1vcmdhbigndGlueScpKVxyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gIH1cclxufVxyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQTRRLFNBQVMsY0FBYyxhQUFhO0FBQ2hULE9BQU8sWUFBWTtBQUNuQixTQUFTLHFCQUFxQjtBQUM5QixTQUFTLGtCQUFrQjtBQUMzQixTQUFTLG9CQUF3QztBQUNqRCxPQUFPLG1CQUFtQjtBQUUxQixJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixPQUFPLEVBQUUsVUFBVSxLQUFLO0FBQUEsRUFDeEIsU0FBUztBQUFBLElBQ1AsYUFBYTtBQUFBLElBQ2IsY0FBYztBQUFBLElBQ2QsY0FBYztBQUFBLElBQ2QsTUFBTTtBQUFBLE1BQ0osbUJBQW1CLENBQUMsTUFBTTtBQUFBLE1BQzFCLG9CQUFvQjtBQUFBLE1BQ3BCLFFBQVEsT0FBTSxpQkFBZ0I7QUFDNUIsZUFBTyxXQUFXLFVBQVUsY0FBYztBQUFBLFVBQ3hDLG1CQUFtQixDQUFDLDZCQUE2QixVQUFVO0FBQUEsUUFDN0QsQ0FBQztBQUFBLE1BQ0g7QUFBQSxJQUNGLENBQUM7QUFBQSxFQUNIO0FBQ0YsQ0FBQztBQUVELFNBQVMsZUFBZTtBQUN0QixTQUFPO0FBQUEsSUFDTCxNQUFNO0FBQUEsSUFDTixnQkFBZ0IsUUFBdUI7QUFDckMsYUFBTyxNQUFNO0FBQ1gsZUFBTyxZQUFZLElBQUksT0FBTyxNQUFNLENBQUM7QUFBQSxNQUN2QztBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0Y7IiwKICAibmFtZXMiOiBbXQp9Cg==
