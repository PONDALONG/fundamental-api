const copyfiles = require('copyfiles');
const path = require("path");

// Define the source folder and destination folder
const sourceFolder = path.join(__dirname,'uploads');
const destinationFolder = 'dist/uploads'; // This is the default build output folder for NestJS

// Use copyfiles to copy the folder to the destination
copyfiles([`${sourceFolder}/`, destinationFolder], { up: true }, (err) => {
  if (err) {
    console.error('Error copying folder:', err);
    process.exit(1);
  }
  console.log('Folder copied successfully!');
});
