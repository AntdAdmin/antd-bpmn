import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import {resolve} from 'path';
import dts from 'vite-plugin-dts'

export default defineConfig({
    build: {
        lib: {
            entry: resolve(__dirname, './src/AntdBpmn/index.tsx'),
            name: 'antd-crud',
            // fileName: (format) => `index.${format}.js`
            fileName: `index`,
            formats: ["es", "cjs"]
        },

        rollupOptions: {
            // external: ['react', 'react-dom', "diagram-js-minimap", "bpmn-js", "antd", "@ant-design/icons"],
            external: ['react', 'react-dom', "antd", "@ant-design/icons"],
            output: {
                // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
                globals: {
                    react: 'React',
                },
            },
        },
        // outDir: 'dist',
    },
    //通过 dts 自动生成 d.ts 文件，方便在 typescript 中使用
    plugins: [react(), dts({rollupTypes: true})],
})
