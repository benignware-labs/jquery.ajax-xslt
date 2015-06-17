module.exports = function(grunt) {

  grunt.initConfig({
    jshint: {
      files: ['Gruntfile.js', 'src/**/*.js', 'test/**/*.js'],
      options: {
        globals: {
          jQuery: true
        }
      }
    },
    watch: {
      dist: {
        files: ["src/**/*.js"],
        tasks: ['build']
      }
    },
    copy: {
      dist: {
        expand: true,
        cwd: 'src',
        src: ['jquery.ajax-xslt.js'],
        dest: 'dist/'
      }
    },
    uglify: {
      dist: {
        files: {
          'dist/jquery.ajax-xslt.min.js': ['src/jquery.ajax-xslt.js']
        }
      }
    },
    qunit: {
      all: ['test/**/*.html']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks("grunt-contrib-qunit");

  grunt.registerTask('build', ['jshint', 'copy:dist', 'uglify:dist']);
  
  // Due to https://github.com/ariya/phantomjs/issues/10917 command-line-testing won't work
  grunt.registerTask('test', ['qunit']);
  
  grunt.registerTask('default', ['build']);
};