// vite.config.ts
import { defineConfig } from "file:///home/project/node_modules/vite/dist/node/index.js";
import react from "file:///home/project/node_modules/@vitejs/plugin-react/dist/index.js";
import { spawn } from "child_process";
var backendProcess = null;
function backendServerPlugin() {
  return {
    name: "backend-server",
    configureServer() {
      if (!backendProcess) {
        console.log("\u{1F680} Starting backend server on port 3001...");
        backendProcess = spawn("node", ["build/httpServer.js"], {
          stdio: "inherit",
          shell: true
        });
        backendProcess.on("error", (err) => {
          console.error("\u274C Backend server error:", err);
        });
      }
    },
    closeBundle() {
      if (backendProcess) {
        console.log("\u{1F6D1} Stopping backend server...");
        backendProcess.kill();
        backendProcess = null;
      }
    }
  };
}
var vite_config_default = defineConfig({
  plugins: [react(), backendServerPlugin()],
  root: ".",
  publicDir: "public",
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        main: "./index.html"
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJ1xuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0J1xuaW1wb3J0IHsgc3Bhd24sIENoaWxkUHJvY2VzcyB9IGZyb20gJ2NoaWxkX3Byb2Nlc3MnXG5cbmxldCBiYWNrZW5kUHJvY2VzczogQ2hpbGRQcm9jZXNzIHwgbnVsbCA9IG51bGxcblxuLy8gUGx1Z2luIHRvIHN0YXJ0IGJhY2tlbmQgc2VydmVyXG5mdW5jdGlvbiBiYWNrZW5kU2VydmVyUGx1Z2luKCkge1xuICByZXR1cm4ge1xuICAgIG5hbWU6ICdiYWNrZW5kLXNlcnZlcicsXG4gICAgY29uZmlndXJlU2VydmVyKCkge1xuICAgICAgaWYgKCFiYWNrZW5kUHJvY2Vzcykge1xuICAgICAgICBjb25zb2xlLmxvZygnXHVEODNEXHVERTgwIFN0YXJ0aW5nIGJhY2tlbmQgc2VydmVyIG9uIHBvcnQgMzAwMS4uLicpXG4gICAgICAgIGJhY2tlbmRQcm9jZXNzID0gc3Bhd24oJ25vZGUnLCBbJ2J1aWxkL2h0dHBTZXJ2ZXIuanMnXSwge1xuICAgICAgICAgIHN0ZGlvOiAnaW5oZXJpdCcsXG4gICAgICAgICAgc2hlbGw6IHRydWVcbiAgICAgICAgfSlcblxuICAgICAgICBiYWNrZW5kUHJvY2Vzcy5vbignZXJyb3InLCAoZXJyKSA9PiB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcignXHUyNzRDIEJhY2tlbmQgc2VydmVyIGVycm9yOicsIGVycilcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9LFxuICAgIGNsb3NlQnVuZGxlKCkge1xuICAgICAgaWYgKGJhY2tlbmRQcm9jZXNzKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdcdUQ4M0RcdURFRDEgU3RvcHBpbmcgYmFja2VuZCBzZXJ2ZXIuLi4nKVxuICAgICAgICBiYWNrZW5kUHJvY2Vzcy5raWxsKClcbiAgICAgICAgYmFja2VuZFByb2Nlc3MgPSBudWxsXG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBwbHVnaW5zOiBbcmVhY3QoKSwgYmFja2VuZFNlcnZlclBsdWdpbigpXSxcbiAgcm9vdDogJy4nLFxuICBwdWJsaWNEaXI6ICdwdWJsaWMnLFxuICBzZXJ2ZXI6IHtcbiAgICBwb3J0OiA1MTczLFxuICAgIHByb3h5OiB7XG4gICAgICAnL2FwaSc6IHtcbiAgICAgICAgdGFyZ2V0OiAnaHR0cDovL2xvY2FsaG9zdDozMDAxJyxcbiAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlXG4gICAgICB9XG4gICAgfVxuICB9LFxuICBidWlsZDoge1xuICAgIG91dERpcjogJ2Rpc3QnLFxuICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgIGlucHV0OiB7XG4gICAgICAgIG1haW46ICcuL2luZGV4Lmh0bWwnXG4gICAgICB9XG4gICAgfVxuICB9XG59KSJdLAogICJtYXBwaW5ncyI6ICI7QUFBeU4sU0FBUyxvQkFBb0I7QUFDdFAsT0FBTyxXQUFXO0FBQ2xCLFNBQVMsYUFBMkI7QUFFcEMsSUFBSSxpQkFBc0M7QUFHMUMsU0FBUyxzQkFBc0I7QUFDN0IsU0FBTztBQUFBLElBQ0wsTUFBTTtBQUFBLElBQ04sa0JBQWtCO0FBQ2hCLFVBQUksQ0FBQyxnQkFBZ0I7QUFDbkIsZ0JBQVEsSUFBSSxtREFBNEM7QUFDeEQseUJBQWlCLE1BQU0sUUFBUSxDQUFDLHFCQUFxQixHQUFHO0FBQUEsVUFDdEQsT0FBTztBQUFBLFVBQ1AsT0FBTztBQUFBLFFBQ1QsQ0FBQztBQUVELHVCQUFlLEdBQUcsU0FBUyxDQUFDLFFBQVE7QUFDbEMsa0JBQVEsTUFBTSxnQ0FBMkIsR0FBRztBQUFBLFFBQzlDLENBQUM7QUFBQSxNQUNIO0FBQUEsSUFDRjtBQUFBLElBQ0EsY0FBYztBQUNaLFVBQUksZ0JBQWdCO0FBQ2xCLGdCQUFRLElBQUksc0NBQStCO0FBQzNDLHVCQUFlLEtBQUs7QUFDcEIseUJBQWlCO0FBQUEsTUFDbkI7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNGO0FBR0EsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUyxDQUFDLE1BQU0sR0FBRyxvQkFBb0IsQ0FBQztBQUFBLEVBQ3hDLE1BQU07QUFBQSxFQUNOLFdBQVc7QUFBQSxFQUNYLFFBQVE7QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE9BQU87QUFBQSxNQUNMLFFBQVE7QUFBQSxRQUNOLFFBQVE7QUFBQSxRQUNSLGNBQWM7QUFBQSxNQUNoQjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDQSxPQUFPO0FBQUEsSUFDTCxRQUFRO0FBQUEsSUFDUixlQUFlO0FBQUEsTUFDYixPQUFPO0FBQUEsUUFDTCxNQUFNO0FBQUEsTUFDUjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
