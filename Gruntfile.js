module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        babel: {
            options: {
                presets: ['es2015']
            },
            dist: {
                files: {
                    'public/dist/js/app.js': 'public/src/js/app.js'
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-babel');
    grunt.registerTask('default', ['babel']);
};
