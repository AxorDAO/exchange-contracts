const fs = require('fs-extra');
const path = require('path');
const { exec } = require('child_process');

const contractsDir = 'contracts'; // Path to your Solidity contracts
const outputDir = 'flattened-contracts'; // Directory to save the flattened files

// Ensure the output directory exists
fs.ensureDirSync(outputDir);

// Function to flatten a Solidity file
const flattenContract = (filePath) => {
  return new Promise((resolve, reject) => {
    const fileName = path.basename(filePath, '.sol') + '_merged.sol';
    const sourceOutputFilePath = path.join(path.dirname(filePath), fileName);
    const outputFilePath = path.join(outputDir, fileName);

    exec(`npx sol-merger ${filePath}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error flattening ${filePath}: ${error}`);
        console.error(`stderr: ${stderr}`);
        reject(error);
      } else {
        // Move the merged file to the output directory
        fs.move(sourceOutputFilePath, outputFilePath, { overwrite: true }, (moveError) => {
          if (moveError) {
            console.error(`Error moving file ${sourceOutputFilePath} to ${outputFilePath}: ${moveError}`);
            reject(moveError);
          } else {
            console.log(`Flattened and moved ${filePath} to ${outputFilePath}`);
            resolve();
          }
        });
      }
    });
  });
};

// Function to recursively get all Solidity files in a directory
const getSolidityFiles = (dir) => {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      // Recurse into subdirectory
       // Skip the 'test' directory
       if (file !== 'test') {
          results = results.concat(getSolidityFiles(filePath));
       }
    } else if (filePath.endsWith('.sol')) {
      // Add .sol file to results
      results.push(filePath);
    }
  });
  return results;
};

// Function to flatten all contracts in the directory
const flattenAllContracts = async () => {
  try {
    const files = getSolidityFiles(contractsDir);
    if (files.length === 0) {
      console.log('No Solidity files found in the specified directory.');
      return;
    }

    for (const file of files) {
      await flattenContract(file);
    }
    console.log('All contracts have been flattened and moved successfully.');
  } catch (error) {
    console.error('Error flattening contracts:', error);
  }
};

// Run the script
flattenAllContracts();