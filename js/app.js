import { db } from "./database.js";
window.db = db;
import {
    criarTabelas,
    salvarDadosNoLocalStorage,
    carregarDadosDoLocalStorage,
    cadastrarUsuario,
    autenticarUsuario,
    //resetarBancoDeDados
} from "./database.js";
import {
    alternarTelas,
    exibirErro,
    exibirSucesso,
    configurarUpload,
} from "./ui.js";

document.addEventListener("DOMContentLoaded", () => {
    //resetarBancoDeDados();
    criarTabelas();
    carregarDadosDoLocalStorage();

    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const usuario = document.getElementById("usuario").value.trim();
            const senha = document.getElementById("senha").value.trim();

            try {
                autenticarUsuario(usuario, senha);
                exibirSucesso("Login realizado com sucesso!");
                salvarDadosNoLocalStorage();
                window.location.href = "clientes.html";
            } catch (error) {
                exibirErro(error.message);
            }
        });
    }

    const cadastroUsuarioForm = document.getElementById("cadastroUsuarioForm");
    if (cadastroUsuarioForm) {
        cadastroUsuarioForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const novoUsuario = document.getElementById("novoUsuario").value.trim();
            const novaSenha = document.getElementById("novaSenha").value.trim();

            try {
                cadastrarUsuario(novoUsuario, novaSenha);
                exibirSucesso("Usuário cadastrado com sucesso!");
                cadastroUsuarioForm.reset();
                alternarTelas("cadastroScreen", "loginScreen");
                salvarDadosNoLocalStorage();
            } catch (error) {
                exibirErro(error.message);
            }
        });
    }

    const cadastrarUsuarioLink = document.getElementById("cadastrarUsuarioLink");
    const voltarLoginLink = document.getElementById("voltarLoginLink");

    if (cadastrarUsuarioLink) {
        cadastrarUsuarioLink.addEventListener("click", (e) => {
            e.preventDefault();
            alternarTelas("loginScreen", "cadastroScreen");
        });
    }

    if (voltarLoginLink) {
        voltarLoginLink.addEventListener("click", (e) => {
            e.preventDefault();
            alternarTelas("cadastroScreen", "loginScreen");
        });
    }

    configurarUpload((jsonData) => {
        if (jsonData.usuarios && jsonData.usuarios.length > 0) {
            jsonData.usuarios.forEach(usuario => {
                const query = `SELECT * FROM usuarios WHERE usuario = '${usuario.usuario}'`;
                const userExists = db.exec(query);
    
                if (userExists.length === 0) {
                    db.exec(`INSERT INTO usuarios (usuario, senha) VALUES ('${usuario.usuario}', '${usuario.senha}')`); 
                } else {
                    console.warn(`Usuário "${usuario.usuario}" já existe e não será importado.`);
                }
            });
    
            salvarDadosNoLocalStorage();
        } else {
            console.warn("Nenhum dado de usuário encontrado no arquivo JSON.");
        }
    });
});