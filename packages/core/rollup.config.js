import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import { terser } from 'rollup-plugin-terser';

export default {
    input: 'index.js',
    output: {
        file: 'dist/mini-vue2.js',
        format: 'umd',
        name: 'miniVue2',
    },
    plugins: [
        resolve(),
        commonjs(),
        babel({
            exclude: 'node_modules/**',
        }),
        terser({
            format: {
                comments: false, // 去除注释
            },
        }),
    ],
};
