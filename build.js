'use strict'
require('shelljs/make')
process.on('unhandledRejection', e => console.log(e))

const
    pkg = require('./package.json'),
    name = pkg.name.startsWith('@theatersoft') && pkg.name.slice(13),
    DIST = process.env.DIST === 'true',
    deleteKey = (o, k) => (k && delete o[k], o),
    dependencies = deleteKey(pkg.dist.dependencies, DIST && 'remote-redux-devtools'),
    path = require('path'),
    fs = require('fs'),
    writeJson = (file, json) => fs.writeFileSync(file, JSON.stringify(json, null, '  '), 'utf-8'),
    copyright = `/*\n${fs.readFileSync('COPYRIGHT', 'utf8')}\n */`,
    {rollup} = require('rollup'),
    nodeResolve = require('rollup-plugin-node-resolve'),
    babel = require('rollup-plugin-babel'),
    ignore = require('rollup-plugin-ignore'),
    strip = require('rollup-plugin-strip')

const targets = {
    node () {
        console.log('target node')
        exec('mkdir -p dist')
        rollup({
                entry: 'src/index',
                external: [
                    'util',
                    ...Object.keys(dependencies)
                ],
                plugins: [
                    babel({
                        babelrc: false,
                        comments: !DIST,
                        minified: DIST,
                        //presets: [babili],
                        plugins: [
                            //require("babel-plugin-transform-class-properties"),
                            [require("babel-plugin-transform-object-rest-spread"), {useBuiltIns: true}]
                        ].concat(DIST ? [
                            require("babel-plugin-minify-constant-folding"),
                            //require("babel-plugin-minify-dead-code-elimination"), // FAIL NodePath has been removed so is read-only
                            require("babel-plugin-minify-flip-comparisons"),
                            require("babel-plugin-minify-guarded-expressions"),
                            require("babel-plugin-minify-infinity"),
                            require("babel-plugin-minify-mangle-names"),
                            require("babel-plugin-minify-replace"),
                            //FAIL require("babel-plugin-minify-simplify"),
                            require("babel-plugin-minify-type-constructors"),
                            require("babel-plugin-transform-member-expression-literals"),
                            require("babel-plugin-transform-merge-sibling-variables"),
                            require("babel-plugin-transform-minify-booleans"),
                            require("babel-plugin-transform-property-literals"),
                            require("babel-plugin-transform-simplify-comparison-operators"),
                            require("babel-plugin-transform-undefined-to-void")
                        ] : [])
                    }),
                    DIST && ignore(['remote-redux-devtools']),
                    DIST && strip({functions: ['devToolsEnhancer']}),
                    nodeResolve({jsnext: true})
                ]
            })
            .then(bundle => {
                bundle.write({
                        dest: `dist/${name}.js`,
                        format: 'cjs',
                        moduleName: name,
                        banner: copyright,
                        sourceMap: DIST ? false : 'inline'
                    })
                    .then(() => console.log(`wrote dist/${name}.js`))
            })
    },

    start () {
        console.log('target node')
        exec('mkdir -p dist')
        rollup({
            entry: 'start.js',
            external: [
                ...Object.keys(dependencies)
            ],
            plugins: [
                babel({
                    babelrc: false,
                    comments: !DIST,
                    minified: DIST,
                    plugins: [
                        [require("babel-plugin-transform-object-rest-spread"), {useBuiltIns: true}]
                    ]
                }),
                nodeResolve({jsnext: true})
            ]
        })
            .then(bundle =>
                bundle.write({
                    dest: `dist/start.js`,
                    format: 'cjs',
                    moduleName: name,
                    banner: copyright,
                    sourceMap: DIST ? false : 'inline'
                })
                    .then(() => console.log(`wrote dist/start.js`))
            )
    },

    package () {
        writeJson('dist/package.json', Object.assign({}, pkg, {private: !DIST, dist: undefined}, pkg.dist))
        exec('cp LICENSE README.md .npmignore dist')
    },

    publish () {
        console.log('target publish')
        exec('npm publish --access=public dist')
    },

    async all () {
        await target.node()
        await targets.start()
        target.package()
    }
}

Object.assign(target, targets)