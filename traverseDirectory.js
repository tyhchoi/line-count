const fs = require( 'fs' );
const { promisify } = require( 'util' );
const path = require( 'path' );

// Filters files according to config
const filterFiles = ( files, extensions ) => files.filter( file => extensions.some( ext => ext === path.extname( file ) ) );

// Filters directories according to config
const filterDirectories = ( subDirs, exclude ) => subDirs.filter( dir => !exclude.some( ex => dir.endsWith( ex ) ) );

// Reads number of lines in file
const getNumLines = file => new Promise( ( resolve, reject ) => {
  let lineCount = 0;
  fs.createReadStream( file )
    .on( 'data', buffer => {
      let idx = -1;
      lineCount--; // Because the loop will run once for idx=-1
      do {
        idx = buffer.indexOf( 10, idx + 1 );
        lineCount++;
      } while ( idx !== -1 );
    } ).on( 'end', () => {
      resolve( lineCount );
    } ).on( 'error', reject );
} );

// Gets all subDirectories in current directory
const getDirectories = async ( files, directory, lstat ) => {
  const dirs = await Promise.all( files.map( async file => {
    const isDirectory = await lstat( path.join( directory, file ) ).then( data => data.isDirectory() );
    if ( isDirectory ) {
      return file;
    }
    return '';
  } ) );

  return dirs.filter( rule => rule !== '' );
};

// returns the name, number of files, and number of lines of all subdirectories or of current directory
const returnData = ( data, name, files, lines ) => {
  if ( data.length !== 0 ) {
    const totalValues = data.reduce( ( acc, val ) => {
      const numFiles = acc.numFiles + val[0].numFiles;
      const numLines = acc.numLines + val[0].numLines;
      return { numFiles, numLines };
    }, { numFiles: 0, numLines: 0 } );

    const totalFiles = totalValues.numFiles + files;
    const totalLines = totalValues.numLines + lines;

    return { name, numFiles: totalFiles, numLines: totalLines };
  }

  return { name, numFiles: files, numLines: lines };
};

// recursively traverse directory
const traverseDirectory = async ( prevDir, directory, exclude, extensions ) => {
  const readdir = promisify( fs.readdir ).bind( fs );
  const lstat = promisify( fs.lstat ).bind( fs );

  const files = await readdir( directory );
  const subDirectories = await getDirectories( files, directory, lstat );
  const filteredDirs = filterDirectories( subDirectories.map( dir => path.join( directory, dir ) ), exclude );

  let subDirOutput = [];

  if ( filteredDirs.length !== 0 ) {
    const traverseSub = filteredDirs.map( subdir => traverseDirectory( directory, subdir, exclude, extensions ) );
    subDirOutput = await Promise.all( traverseSub );
  }

  const notDirectories = files.filter( file => !subDirectories.some( subdir => subdir === file ) );
  const filesToRead = filterFiles( notDirectories, extensions );

  const totalLines = await filesToRead.reduce( async ( acc, file ) => {
    const lines = await getNumLines( path.join( directory, file ) );
    const all = await acc + lines;
    return all;
  }, 0 );

  let name = directory.replace( prevDir, '' );

  if ( name === '' ) {
    name = prevDir;
  }

  const returnedData = returnData( subDirOutput, name, filesToRead.length, totalLines );

  subDirOutput.unshift( returnedData );
  return subDirOutput;
};

module.exports = traverseDirectory;
