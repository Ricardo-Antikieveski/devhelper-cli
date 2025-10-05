import inquirer from "inquirer";
import ora from "ora";
import fs from "fs-extra";
import chalk from "chalk";
import path from "path";
import { execa } from "execa";

export async function InitCommand() {
    console.clear();
    console.log(chalk.cyanBright("🧩 DevHelper CLI - Assistente de Projeto\n"));

    // ------------------- Prompt inicial -------------------
    const answers = await inquirer.prompt([
        {
            type: "list",
            name: "template",
            message: "Qual projeto deseja criar?",
            choices: ["React", "Node", "HTML + CSS + JS", "Rust", "Baixar Repositório GIT"],
        },
        {
            type: "input",
            name: "projectName",
            message: "Nome do seu projeto: ",
            default: "meu-projeto-pessoal",
        },
    ]);

    const { template, projectName } = answers;
    const projectPath = path.join(process.cwd(), projectName);

    if (fs.pathExistsSync(projectPath)) {
        console.log(chalk.red(`❌ A pasta '${projectName}' já existe.`));
        return;
    }

    // ------------------- Switch templates -------------------
    switch (template) {

        // ------------------- HTML + CSS + JS -------------------
        case "HTML + CSS + JS":
            await createHTMLTemplate(projectPath);
            console.log(chalk.green(`✅ Projeto '${projectName}' criado com sucesso!`));
            console.log(chalk.cyan(`\n📁 Local: ${projectPath}`));
            console.log(chalk.yellow("\n➡️ Próximos passos:"));
            console.log(chalk.gray(`cd ${projectName}`));
            console.log(chalk.gray("Abra index.html no navegador"));
            break;

        // ------------------- Rust -------------------
        case "Rust": {
            const spinner = ora(`📥 Criando projeto Rust '${projectName}'...`).start();
            try {
                await execa("cargo", ["new", projectName], { stdio: "inherit" });
                spinner.succeed(`✅ Projeto Rust '${projectName}' criado com sucesso!`);
                console.log(chalk.cyan(`\n📁 Local: ${projectPath}`));
            } catch (err) {
                spinner.fail("❌ Falha ao criar projeto Rust");
                console.error(err);
            }
            break;
        }

        // ------------------- React -------------------
        case "React": {
            const spinner = ora(`📥 Baixando template React (Vite)...`).start();
            try {
                await execa("npx", ["create-vite@latest", projectName, "--template", "react"], { stdio: "inherit", shell: true });
                spinner.succeed(`✅ Projeto React '${projectName}' criado com sucesso!`);
                console.log(chalk.cyan(`\n📁 Local: ${projectPath}`));
                console.log(chalk.yellow("\n➡️ Próximos passos:"));
                console.log(chalk.gray(`cd ${projectName}`));
                console.log(chalk.gray("npm install"));
                console.log(chalk.gray("npm run dev"));
            } catch (err) {
                spinner.fail("❌ Falha ao criar projeto React");
                console.error(err);
            }
            break;
        }

        // ------------------- Node -------------------
        case "Node": {
            const spinner = ora(`📥 Criando template Node '${projectName}'...`).start();
            try {
                await fs.ensureDir(projectPath);
                process.chdir(projectPath);
                await fs.writeFile("index.js", `console.log("Olá, Node!");\n`);
                spinner.succeed(`✅ Projeto Node '${projectName}' criado com sucesso!`);
                console.log(chalk.cyan(`\n📁 Local: ${projectPath}`));
                console.log(chalk.yellow("\n➡️ Próximos passos:"));
                console.log(chalk.gray(`cd ${projectName}`));
                console.log(chalk.gray("node index.js"));
            } catch (err) {
                spinner.fail("❌ Falha ao criar projeto Node");
                console.error(err);
            }
            break;
        }

        // ------------------- Baixar Repositório GIT -------------------
        case "Baixar Repositório GIT": {
            // Usa o projectName já definido
            const { repoURL } = await inquirer.prompt([
                {
                    type: "input",
                    name: "repoURL",
                    message: "Digite a URL do repositório GIT que deseja clonar:",
                },
            ]);

            const gitProjectPath = path.join(process.cwd(), projectName); // usa projectName da primeira pergunta

            if (fs.existsSync(gitProjectPath)) {
                console.log(chalk.red(`❌ A pasta '${projectName}' já existe.`));
                break;
            }

            const gitSpinner = ora(`Clonando ${repoURL} em ${gitProjectPath}...`).start();

            try {
                await execa("git", ["clone", repoURL, gitProjectPath], { stdio: "inherit", shell: true });

                const packageJson = path.join(gitProjectPath, "package.json");
                if (fs.existsSync(packageJson)) {
                    process.chdir(gitProjectPath);
                    const installSpinner = ora("Instalando dependências...").start();
                    await execa("npm", ["install"], { stdio: "inherit", shell: true });
                    installSpinner.succeed("✅ Dependências instaladas");
                }

                gitSpinner.succeed(`✅ Repositório clonado com sucesso em ${gitProjectPath}`);
            } catch (err) {
                gitSpinner.fail("❌ Erro ao clonar o repositório");
                console.error(err);
            }
            break;
        }

        default:
            console.log(chalk.red("❌ Template inválido."));
    }
}

// ------------------- Função do template HTML + CSS + JS -------------------
async function createHTMLTemplate(projectPath) {
    await fs.ensureDir(projectPath);
    process.chdir(projectPath);

    await fs.writeFile("index.html", `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Meu Projeto</title>
<link rel="stylesheet" href="style.css">
</head>
<body>
<div class="container">
<h1>Olá, Mundo!</h1>
<button id="btn">Clique aqui</button>
</div>
<script src="script.js"></script>
</body>
</html>
  `);

    await fs.writeFile("style.css", `
body { font-family: Arial, sans-serif; background-color: #1e1e1e; color: white; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
.container { text-align: center; }
button { padding: 10px 20px; background-color: #4f46e5; color: white; border: none; border-radius: 5px; cursor: pointer; }
button:hover { background-color: #3730a3; }
  `);

    await fs.writeFile("script.js", `
const btn = document.getElementById("btn");
btn.addEventListener("click", () => { alert("Você clicou no botão!"); });
  `);
}
