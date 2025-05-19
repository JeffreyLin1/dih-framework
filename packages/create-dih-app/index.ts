#!/usr/bin/env node

import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import ora from 'ora';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

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
        name: 'packageManager',
        message: 'Select a package manager:',
        choices: ['npm', 'yarn', 'pnpm'],
        default: 'npm'
      },
      {
        type: 'confirm',
        name: 'installDeps',
        message: 'Do you want to install dependencies now?',
        default: true
      }
    ]);
    
    const spinner = ora('Creating your DIH application...').start();
    
    try {
      // Create project structure based on template
      await createProjectStructure(projectPath, 'with-nextjs');
      
      spinner.succeed(chalk.green('Project created successfully!'));
      
      // Install dependencies if requested
      if (answers.installDeps) {
        spinner.start('Installing dependencies...');
        try {
          const installCommand = getInstallCommand(answers.packageManager);
          execSync(installCommand, { cwd: projectPath, stdio: 'ignore' });
          spinner.succeed(chalk.green('Dependencies installed successfully!'));
        } catch (error) {
          spinner.fail(chalk.red('Failed to install dependencies'));
          console.error('You can install them manually by running:');
          console.log(`  cd ${chalk.cyan(projectDirectory)}`);
          if (answers.packageManager === 'npm') {
            console.log(`  ${chalk.cyan('npm install')}`);
          } else if (answers.packageManager === 'yarn') {
            console.log(`  ${chalk.cyan('yarn')}`);
          } else if (answers.packageManager === 'pnpm') {
            console.log(`  ${chalk.cyan('pnpm install')}`);
          }
        }
      }
      
      console.log('\nNext steps:');
      console.log(`  cd ${chalk.cyan(projectDirectory)}`);
      
      if (!answers.installDeps) {
        if (answers.packageManager === 'npm') {
          console.log(`  ${chalk.cyan('npm install')}`);
        } else if (answers.packageManager === 'yarn') {
          console.log(`  ${chalk.cyan('yarn')}`);
        } else if (answers.packageManager === 'pnpm') {
          console.log(`  ${chalk.cyan('pnpm install')}`);
        }
      }
      
      if (answers.packageManager === 'npm') {
        console.log(`  ${chalk.cyan('npm run dev')}`);
      } else if (answers.packageManager === 'yarn') {
        console.log(`  ${chalk.cyan('yarn dev')}`);
      } else if (answers.packageManager === 'pnpm') {
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

function getInstallCommand(packageManager: string): string {
  switch (packageManager) {
    case 'npm':
      return 'npm install';
    case 'yarn':
      return 'yarn';
    case 'pnpm':
      return 'pnpm install';
    default:
      return 'npm install';
  }
}

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
    throw new Error(`Next.js template not found at ${templatePath}`);
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
