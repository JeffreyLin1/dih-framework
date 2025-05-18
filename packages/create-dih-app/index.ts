#!/usr/bin/env node

import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import ora from 'ora';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const program = new Command();

program
  .name('create-dih-app')
  .description('Create a new DIH application')
  .version('0.1.0')
  .argument('[project-directory]', 'Directory to create the project in')
  .action(async (projectDirectory: string | undefined) => {
    console.log(chalk.bold('\n🚀 Welcome to DIH Framework - AI Application Builder\n'));
    
    // If no project directory was provided, ask for it
    if (!projectDirectory) {
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'projectName',
          message: 'What is your project named?',
          default: 'my-dih-app'
        }
      ]);
      projectDirectory = answers.projectName;
    }
    
    // Ensure projectDirectory is not undefined
    if (!projectDirectory) {
      projectDirectory = 'my-dih-app';
    }
    
    const projectPath = path.resolve(process.cwd(), projectDirectory);
    
    // Check if directory exists and is not empty
    if (fs.existsSync(projectPath)) {
      const files = fs.readdirSync(projectPath);
      if (files.length > 0) {
        const { overwrite } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'overwrite',
            message: `Directory ${projectDirectory} is not empty. Do you want to overwrite it?`,
            default: false
          }
        ]);
        
        if (!overwrite) {
          console.log(chalk.red('Aborting installation'));
          process.exit(1);
        }
        
        fs.emptyDirSync(projectPath);
      }
    } else {
      fs.mkdirSync(projectPath, { recursive: true });
    }
    
    // Ask for project configuration
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'template',
        message: 'Select a template:',
        choices: ['basic', 'with-typescript', 'with-nextjs'],
        default: 'basic'
      },
      {
        type: 'list',
        name: 'packageManager',
        message: 'Select a package manager:',
        choices: ['npm', 'yarn', 'pnpm'],
        default: 'npm'
      }
    ]);
    
    const spinner = ora('Creating your DIH application...').start();
    
    try {
      // Create project structure based on template
      await createProjectStructure(projectPath, answers.template);
      
      spinner.succeed(chalk.green('Project created successfully!'));
      
      console.log('\nNext steps:');
      console.log(`  cd ${chalk.cyan(projectDirectory)}`);
      
      if (answers.packageManager === 'npm') {
        console.log(`  ${chalk.cyan('npm install')}`);
        console.log(`  ${chalk.cyan('npm run dev')}`);
      } else if (answers.packageManager === 'yarn') {
        console.log(`  ${chalk.cyan('yarn')}`);
        console.log(`  ${chalk.cyan('yarn dev')}`);
      } else if (answers.packageManager === 'pnpm') {
        console.log(`  ${chalk.cyan('pnpm install')}`);
        console.log(`  ${chalk.cyan('pnpm dev')}`);
      }
      
      console.log('\nTo learn more about DIH Framework, check out the documentation:');
      console.log(chalk.cyan('https://github.com/jeffreylin1/dih-framework'));
      
    } catch (error) {
      spinner.fail(chalk.red('Failed to create project'));
      console.error(error);
      process.exit(1);
    }
  });

async function createProjectStructure(projectPath: string, template: string): Promise<void> {
  // Try to find templates in different locations
  let templatesDir = path.join(__dirname, 'templates');
  
  // If templates directory doesn't exist at the expected location (production build),
  // try to find it relative to the current file (development)
  if (!fs.existsSync(templatesDir)) {
    // Try parent directory (for when running from dist folder)
    templatesDir = path.join(__dirname, '..', 'templates');
    
    if (!fs.existsSync(templatesDir)) {
      throw new Error(`Templates directory not found. Tried: ${path.join(__dirname, 'templates')} and ${templatesDir}`);
    }
  }
  
  const templatePath = path.join(templatesDir, template);
  
  // Check if template exists
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template "${template}" not found at ${templatePath}`);
  }
  
  // Copy template files to project directory
  await fs.copy(templatePath, projectPath);
  
  // Update package.json with project name
  const packageJsonPath = path.join(projectPath, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = await fs.readJson(packageJsonPath);
    packageJson.name = path.basename(projectPath);
    await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
  }
  
  // Create a .env file with placeholder for API key if it doesn't exist
  const envPath = path.join(projectPath, '.env');
  if (!fs.existsSync(envPath)) {
    await fs.writeFile(envPath, 'DIH_API_KEY=your_api_key_here\n');
  }
  
  // Create a .gitignore file if it doesn't exist
  const gitignorePath = path.join(projectPath, '.gitignore');
  if (!fs.existsSync(gitignorePath)) {
    await fs.writeFile(gitignorePath, 
      'node_modules\n.env\n.DS_Store\ndist\n.next\n.vercel\n');
  }
}

// Run the CLI
program.parse(process.argv);
