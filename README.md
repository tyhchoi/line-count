# line-count
A recursive node program that prints the number of files and lines for the target directory and its subdirectories using only asynchronous fs methods and promises.

### Config
It will load a config file `.line-count.json` in the target directory if it exists, else, it will use a default config. The exclude array contains folders that will be excluded. The extensions array contains the file extensions that will be checked.

##### Example
```json
{
  exclude: [
    'node_modules',
    '.git'
  ],
  extensions: [
    '.js',
    '.jsx',
    '.json'
  ]
}
```

### Sample Output
Run the program: `node line-count.js /example`

Output:
```
/example = 32 files, 4775 lines
  /folder_1 = 4 files, 160 lines
  /folder_2 = 4 files, 203 lines
  /folder_3 = 12 files, 861 lines
    /subfolder_1 = 2 files, 221 lines
    /subfolder_2 = 6 files, 465 lines
    /subfolder_3 = 2 files, 68 lines
    /subfolder_4 = 2 files, 107 lines
  /folder_4 = 1 files, 100 lines
    /subfolder_5 = 0 files, 0 lines
    /subfolder_6 = 0 files, 0 lines
    /subfolder_7 = 1 files, 100 lines
  /folder_5 = 1 files, 39 lines
  /folder_6 = 4 files, 180 lines
  /folder_7 = 2 files, 57 lines
    /subfolder_8 = 0 files, 0 lines
      /subfolder_9 = 0 files, 0 lines
```
