// vite.config.js
import { defineConfig, loadEnv } from "file:///mnt/d/AURa%20experiment/project/node_modules/vite/dist/node/index.js";
import react from "file:///mnt/d/AURa%20experiment/project/node_modules/@vitejs/plugin-react/dist/index.js";
import path from "path";
import { fileURLToPath } from "url";
var __vite_injected_original_import_meta_url = "file:///mnt/d/AURa%20experiment/project/src/aura-frontend/vite.config.js";
var __filename = fileURLToPath(__vite_injected_original_import_meta_url);
var __dirname = path.dirname(__filename);
var vite_config_default = defineConfig(({ mode }) => {
  const envDir = path.resolve(__dirname, "..", "..");
  const env = loadEnv(mode, envDir, "");
  return {
    plugins: [react()],
    envDir,
    define: {
      "import.meta.env.VITE_CANISTER_ID_AURA_BACKEND": JSON.stringify(env.CANISTER_ID_AURA_BACKEND || env.VITE_CANISTER_ID_AURA_BACKEND || ""),
      "import.meta.env.VITE_DFX_NETWORK": JSON.stringify(env.DFX_NETWORK || env.VITE_DFX_NETWORK || "local"),
      global: "globalThis",
      "process.env": {}
    },
    resolve: {
      alias: {
        // Point to src/declarations where `dfx generate` places files in this project
        "declarations": path.resolve(__dirname, "..", "..", "src", "declarations")
      }
    },
    server: {
      proxy: {
        "/api": {
          target: "http://127.0.0.1:4943",
          changeOrigin: true
        }
      }
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvbW50L2QvQVVSYSBleHBlcmltZW50L3Byb2plY3Qvc3JjL2F1cmEtZnJvbnRlbmRcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9tbnQvZC9BVVJhIGV4cGVyaW1lbnQvcHJvamVjdC9zcmMvYXVyYS1mcm9udGVuZC92aXRlLmNvbmZpZy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vbW50L2QvQVVSYSUyMGV4cGVyaW1lbnQvcHJvamVjdC9zcmMvYXVyYS1mcm9udGVuZC92aXRlLmNvbmZpZy5qc1wiO2ltcG9ydCB7IGRlZmluZUNvbmZpZywgbG9hZEVudiB9IGZyb20gXCJ2aXRlXCI7XHJcbmltcG9ydCByZWFjdCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3RcIjtcclxuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcclxuaW1wb3J0IHsgZmlsZVVSTFRvUGF0aCB9IGZyb20gJ3VybCc7XHJcblxyXG4vLyAtLS0gUEVSQkFJS0FOIERJTVVMQUkgREkgU0lOSSAtLS1cclxuLy8gTWVuZGVmaW5pc2lrYW4gX19kaXJuYW1lIHNlY2FyYSBtYW51YWwgdW50dWsgbGluZ2t1bmdhbiBFUyBNb2R1bGVcclxuY29uc3QgX19maWxlbmFtZSA9IGZpbGVVUkxUb1BhdGgoaW1wb3J0Lm1ldGEudXJsKTtcclxuY29uc3QgX19kaXJuYW1lID0gcGF0aC5kaXJuYW1lKF9fZmlsZW5hbWUpO1xyXG4vLyAtLS0gUEVSQkFJS0FOIFNFTEVTQUkgLS0tXHJcblxyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgbW9kZSB9KSA9PiB7XHJcbiAgLy8gUHJvamVjdCByb290IGRpcmVjdG9yeSAoY29udGFpbnMgZGZ4Lmpzb24gYW5kIC5lbnYgb3V0cHV0IGJ5IERGWClcclxuICBjb25zdCBlbnZEaXIgPSBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4uXCIsIFwiLi5cIik7XHJcbiAgY29uc3QgZW52ID0gbG9hZEVudihtb2RlLCBlbnZEaXIsIFwiXCIpO1xyXG4gIHJldHVybiB7XHJcbiAgICBwbHVnaW5zOiBbcmVhY3QoKV0sXHJcbiAgICBlbnZEaXIsXHJcbiAgICBkZWZpbmU6IHtcclxuICAgICAgJ2ltcG9ydC5tZXRhLmVudi5WSVRFX0NBTklTVEVSX0lEX0FVUkFfQkFDS0VORCc6IEpTT04uc3RyaW5naWZ5KGVudi5DQU5JU1RFUl9JRF9BVVJBX0JBQ0tFTkQgfHwgZW52LlZJVEVfQ0FOSVNURVJfSURfQVVSQV9CQUNLRU5EIHx8IFwiXCIpLFxyXG4gICAgICAnaW1wb3J0Lm1ldGEuZW52LlZJVEVfREZYX05FVFdPUksnOiBKU09OLnN0cmluZ2lmeShlbnYuREZYX05FVFdPUksgfHwgZW52LlZJVEVfREZYX05FVFdPUksgfHwgXCJsb2NhbFwiKSxcclxuICAgICAgZ2xvYmFsOiAnZ2xvYmFsVGhpcycsXHJcbiAgICAgICdwcm9jZXNzLmVudic6IHt9LFxyXG4gICAgfSxcclxuICAgIHJlc29sdmU6IHtcclxuICAgICAgYWxpYXM6IHtcclxuICAgICAgICAvLyBQb2ludCB0byBzcmMvZGVjbGFyYXRpb25zIHdoZXJlIGBkZnggZ2VuZXJhdGVgIHBsYWNlcyBmaWxlcyBpbiB0aGlzIHByb2plY3RcclxuICAgICAgICBcImRlY2xhcmF0aW9uc1wiOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4uXCIsIFwiLi5cIiwgXCJzcmNcIiwgXCJkZWNsYXJhdGlvbnNcIiksXHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAgc2VydmVyOiB7XHJcbiAgICAgIHByb3h5OiB7XHJcbiAgICAgICAgXCIvYXBpXCI6IHtcclxuICAgICAgICAgIHRhcmdldDogXCJodHRwOi8vMTI3LjAuMC4xOjQ5NDNcIixcclxuICAgICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcclxuICAgICAgICB9LFxyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICB9O1xyXG59KTsiXSwKICAibWFwcGluZ3MiOiAiO0FBQW9VLFNBQVMsY0FBYyxlQUFlO0FBQzFXLE9BQU8sV0FBVztBQUNsQixPQUFPLFVBQVU7QUFDakIsU0FBUyxxQkFBcUI7QUFIMEssSUFBTSwyQ0FBMkM7QUFPelAsSUFBTSxhQUFhLGNBQWMsd0NBQWU7QUFDaEQsSUFBTSxZQUFZLEtBQUssUUFBUSxVQUFVO0FBR3pDLElBQU8sc0JBQVEsYUFBYSxDQUFDLEVBQUUsS0FBSyxNQUFNO0FBRXhDLFFBQU0sU0FBUyxLQUFLLFFBQVEsV0FBVyxNQUFNLElBQUk7QUFDakQsUUFBTSxNQUFNLFFBQVEsTUFBTSxRQUFRLEVBQUU7QUFDcEMsU0FBTztBQUFBLElBQ0wsU0FBUyxDQUFDLE1BQU0sQ0FBQztBQUFBLElBQ2pCO0FBQUEsSUFDQSxRQUFRO0FBQUEsTUFDTixpREFBaUQsS0FBSyxVQUFVLElBQUksNEJBQTRCLElBQUksaUNBQWlDLEVBQUU7QUFBQSxNQUN2SSxvQ0FBb0MsS0FBSyxVQUFVLElBQUksZUFBZSxJQUFJLG9CQUFvQixPQUFPO0FBQUEsTUFDckcsUUFBUTtBQUFBLE1BQ1IsZUFBZSxDQUFDO0FBQUEsSUFDbEI7QUFBQSxJQUNBLFNBQVM7QUFBQSxNQUNQLE9BQU87QUFBQTtBQUFBLFFBRUwsZ0JBQWdCLEtBQUssUUFBUSxXQUFXLE1BQU0sTUFBTSxPQUFPLGNBQWM7QUFBQSxNQUMzRTtBQUFBLElBQ0Y7QUFBQSxJQUNBLFFBQVE7QUFBQSxNQUNOLE9BQU87QUFBQSxRQUNMLFFBQVE7QUFBQSxVQUNOLFFBQVE7QUFBQSxVQUNSLGNBQWM7QUFBQSxRQUNoQjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
