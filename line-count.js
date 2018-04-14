const fs = require( 'fs' );
const { promisify } = require( 'util' );
const path = require( 'path' );
const traverseDirectory = require( './traverseDirectory' );

// gets the config, else uses default config
const getConfig = dir => {
  const configPath = path.join( dir, '.line-count.json' );
  const readFile = promisify( fs.readFile ).bind( fs );

  return readFile( configPath, 'utf8' )
    .then( data => JSON.parse( data ) )
    .catch( err => ( {
      exclude: [
        'node_modules',
        '.git'
      ],
      extensions: [
        '.js',
        '.jsx',
        '.json'
      ]
    } ) );
};

// recursively prints array
const printArray = ( array, spacing ) => {
  array.forEach( dir => {
    if ( Array.isArray( dir ) ) {
      printArray( dir, `${spacing}  ` );
    } else {
      console.log( `${spacing}${dir.name} = ${dir.numFiles} files, ${dir.numLines} lines` );
    }
  } );
};

// normalizes exclude rules
const normalizeExclude = exclude => exclude.map( rule => {
  let newRule = rule;
  if ( newRule.charAt( 0 ) !== '/' ) {
    newRule = `/${newRule}`;
  }

  if ( newRule.charAt( newRule.length - 1 ) === '/' ) {
    newRule = newRule.slice( 0, -1 );
  }
  return newRule;
} );

// traverses and prints the target directory
const printDirectory = async mainDir => {
  const { exclude, extensions } = await getConfig( mainDir );
  const output = await traverseDirectory( mainDir, mainDir, normalizeExclude( exclude ), extensions );
  printArray( output, '' );
};

const mainDirectory = process.argv[2];

printDirectory( mainDirectory ).catch( err => console.log( err ) );
