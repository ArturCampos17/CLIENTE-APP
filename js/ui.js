export function alternarTelas(telaAtual, telaDestino) {
    document.getElementById(telaAtual).classList.remove("active");
    document.getElementById(telaDestino).classList.add("active");
}

const novoUsuarioInput = document.getElementById("novoUsuario");
const usuarioFeedback = document.getElementById("usuarioFeedback");

novoUsuarioInput.addEventListener("input", () => {
    const usuario = novoUsuarioInput.value.trim();
    if (usuario) {
        const query = `SELECT * FROM usuarios WHERE usuario = '${usuario}'`;
        const userExists = db.exec(query);

        if (userExists.length > 0) {
            usuarioFeedback.textContent = "Este usuário já está cadastrado.";
            usuarioFeedback.style.color = "red";
        } else {
            usuarioFeedback.textContent = "Nome de usuário disponível.";
            usuarioFeedback.style.color = "green";
        }
    } else {
        usuarioFeedback.textContent = "";
    }
});


export function exibirErro(mensagem) {
    alert(mensagem);
}

export function exibirSucesso(mensagem) {
    alert(mensagem);
}

export function configurarUpload(importarDados) {
    const configuracoesBtn = document.getElementById("configuracoesBtn");
    const uploadDB = document.getElementById("uploadDB");

    configuracoesBtn.addEventListener("click", () => {
        uploadDB.click();
    });

    uploadDB.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const jsonData = JSON.parse(event.target.result);
                    importarDados(jsonData);
                    exibirSucesso("Banco de dados importado com sucesso!");
                } catch (error) {
                    exibirErro("Arquivo inválido. Certifique-se de que é um JSON válido.");
                }
            };
            reader.readAsText(file);
        }
    });
}