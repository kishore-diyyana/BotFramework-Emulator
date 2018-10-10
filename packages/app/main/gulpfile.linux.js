const gulp = require('gulp');
const common = require('./gulpfile.common.js');
const packageJson = require('./package.json');

/** Package the emulator using electron-builder
 *  and output artifacts to /dist/
 */
gulp.task('package', async () => {
  const { getElectronMirrorUrl, getConfig } = common;
  const rename = require('gulp-rename');
  const builder = require('electron-builder');
  const config = getConfig('linux');

  console.log(`Electron mirror: ${getElectronMirrorUrl()}`);

  // create build artifacts
  const filenames = await builder.build({
    targets: builder.Platform.LINUX.createTarget(['deb', 'AppImage'], builder.Arch.ia32, builder.Arch.x64),
    config
  });

  // rename and move the files to the /dist/ directory
  await new Promise(resolve => {
    gulp
      .src(filenames, { allowEmpty: true })
      .pipe(rename(path => {
        path.basename = setReleaseFilename(path.basename);
      }))
      .pipe(gulp.dest('./dist'))
      .on('end', resolve);
  });
});

/** Publish the artifacts in /dist/ to GitHub */
gulp.task('publish', async () => {
  const { publishFiles } = common;
  const filesToPublish = getFilesFromDist();
  await publishFiles(filesToPublish);
});

/** Returns the names of the packaged artifacts in /dist/ */
function getFilesFromDist(options = {}) {
  const { extend } = common;
  options = extend({}, {
    basename: packageJson.packagename,
    version: packageJson.version,
  }, options);
  const path = './dist';

  const filelist = [];
  filelist.push(`${path}/${options.basename}-${options.version}-i386.AppImage`);
  filelist.push(`${path}/${options.basename}-${options.version}-x86_64.AppImage`);
  filelist.push(`${path}/${options.basename}_${options.version}_i386.deb`);
  filelist.push(`${path}/${options.basename}_${options.version}_amd64.deb`);

  return filelist;
}

/** Sets the packaged artifact filename */
function setReleaseFilename(filename, options = {}) {
  const { extend } = common;
  options = extend({}, {
      lowerCase: true,
      replaceWhitespace: true,
      fixBasename: true,
      replaceName: false,
      srcName: null,
      dstName: null
    },
    options
  );
  if (options.replaceName && options.srcName && options.dstName) {
    filename = filename.replace(options.srcName, options.dstName);
  }
  if (options.lowerCase) {
    filename = filename.toLowerCase();
  }
  if (options.replaceWhitespace) {
    filename = filename.replace(/\s/g, '-');
  }
  if (options.fixBasename) {
    // renames build artifacts like 'bot-framework_{version}.*' or 'main_{version}.*'
    // to '{package name in package.json}_{version}.*'
    filename = filename.replace(/(bot[-|\s]framework)?(main)?/, packageJson.packagename);
  }
  return filename;
}