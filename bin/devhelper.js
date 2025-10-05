import { Command } from "commander";
import { InitCommand } from "../commands/init.js";

const program = new Command();

program
.name("devhelper")
.description("CLI para agilizar seu setup de Projetos");

program
.command("init")
.description("Crie um novo projeto a partir de um template")
.action(InitCommand);

program.parse(process.argv);