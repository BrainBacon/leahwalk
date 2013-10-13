'use strict';

var LIVERELOAD_PORT = 35729;
var lrSnippet = require('connect-livereload')({ port: LIVERELOAD_PORT });
var mountFolder = function (connect, dir) {
    return connect.static(require('path').resolve(dir));
};

module.exports = function (grunt) {

    // load all grunt tasks
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    // configurable paths
    var yeomanConfig = {
        app: 'app',
        dist: 'target'
    };

    grunt.initConfig({
        yeoman: yeomanConfig,

        watch: {
            less: {
                files: ['<%= yeoman.app %>/styles/{,*/}*.less'],
                tasks: ['less']
            },
            livereload: {
                options: {
                    livereload: LIVERELOAD_PORT
                },
                files: [
                    '<%= yeoman.app %>/{,*/}*.html',
                    '{.tmp,<%= yeoman.app %>}/styles/{,*/}*.css',
                    '{.tmp,<%= yeoman.app %>}/styles/{,*/}*.styl',
                    '<%= yeoman.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
                ]
            }
        },

        connect: {
            options: {
                port: 9000,
                hostname: '0.0.0.0'
            },
            livereload: {
                options: {
                    middleware: function (connect) {
                        return [
                            lrSnippet,
                            mountFolder(connect, '.tmp'),
                            mountFolder(connect, yeomanConfig.app)
                        ];
                    }
                }
            },
            dist: {
                options: {
                    middleware: function (connect) {
                        return [
                            mountFolder(connect, yeomanConfig.dist)
                        ];
                    }
                }
            }
        },

        clean: {
            dist: {
                files: [{
                    dot: true,
                    src: [
                        '.tmp',
                        '<%= yeoman.dist %>/*',
                        '!<%= yeoman.dist %>/.git*'
                    ]
                }]
            },
            server: '.tmp',
        },

        less: {
            styles: {
                files: [{
                    expand: true,
                    cwd: '<%= yeoman.app %>/styles',
                    src: '{,*/}*.less',
                    dest: '.tmp/styles',
                    ext: '.css'
                }]
            }
        },

        useminPrepare: {
            html: '<%= yeoman.dist %>/index.html',
            options: {
                dest: '<%= yeoman.dist %>'
            }
        },

        htmlmin: {
            deploy: {
                options: {
                    collapseBooleanAttributes: true,
                    removeAttributeQuotes: true,
                    removeRedundantAttributes: true,
                    removeEmptyAttributes: true,
                    removeComments: true,
                    collapseWhitespace: true
                },
                files: [{
                    expand: true,
                    cwd: '<%= yeoman.dist %>',
                    src: ['*.html'],
                    dest: '<%= yeoman.dist %>'
                }]
            }
        },

        copy: {
            dist: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: '<%= yeoman.app %>',
                    dest: '<%= yeoman.dist %>',
                    src: [
                        '*.{ico,png,txt}',
                        '.htaccess',
                        'images/{,*/}*.{gif,webp,svg,png,jpg,jpeg}',
                        'styles/fonts/*',
                        'l10n/randomInputs.txt'
                    ]
                }, {
                    expand: true,
                    cwd: '.tmp/images',
                    dest: '<%= yeoman.dist %>/images',
                    src: [
                        'generated/*'
                    ]
                }]
            }
        },

        concurrent: {
            less: [
                'less'
            ]
        },

        targethtml: {
            options: {
                curlyTags: {
                    buildtime: '<%= grunt.template.today("yymmddHHMM") %>',
                    version: grunt.file.readJSON('package.json').version
                }
            },
            prd: {
                files: {
                    '<%= yeoman.dist %>/index.html': '<%= yeoman.app %>/index.html'
                }
            },
            rev: {
                files: {
                    '<%= yeoman.dist %>/index.html': '<%= yeoman.app %>/index.html'
                }
            }
        }
    });

    grunt.registerTask('server', function (target) {
        if (target === 'dist') {
            return grunt.task.run(['prd', 'connect:dist:keepalive']);
        }

        grunt.task.run([
            'clean:server',
            'concurrent:less',
            'connect:livereload',
            'watch'
        ]);
    });

    grunt.registerTask('prd', [
            'clean:dist',
            'copy:',
            'targethtml:prd',
            'useminPrepare',
            'concurrent:less',
            'concat',
            'cssmin',
            'copy:dist',
            'targethtml:rev',
            'htmlmin:deploy'
    ]);

    grunt.registerTask('default', [
        'prd'
    ]);
};
