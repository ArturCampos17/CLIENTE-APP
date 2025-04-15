import { db, criarTabelas, salvarDadosNoLocalStorage, carregarDadosDoLocalStorage } from "./database.js";

let clienteEmEdicao = null;
let modoEdicao = false;

document.addEventListener("DOMContentLoaded", () => {

    criarTabelas();
    carregarDadosDoLocalStorage();
    carregarListaClientes();

    document.querySelector(".sair").addEventListener("click", () => {
        try {
            localStorage.removeItem("usuarioLogadoId");

            window.location.href = "index.html"; 
         } catch (error) {
            console.error("Erro ao sair do sistema:", error.message);
            alert("Ocorreu um erro ao sair do sistema.");
        }
    });

    const cpfInput = document.getElementById("cpf");
    const telefoneInput = document.getElementById("telefone");
    const celularInput = document.getElementById("celular");

    function formatarCPF(cpf) {
        cpf = cpf.replace(/\D/g, "");
        if (cpf.length > 11) cpf = cpf.substring(0, 11);
        cpf = cpf.replace(/(\d{3})(\d)/, "$1.$2");
        cpf = cpf.replace(/(\d{3})(\d)/, "$1.$2");
        cpf = cpf.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
        return cpf;
    }
   
    function formatarTelefone(telefone) {
        telefone = telefone.replace(/\D/g, "");
        if (telefone.length > 11) telefone = telefone.substring(0, 11);
        telefone = telefone.replace(/^(\d{2})(\d)/g, "($1) $2");
        telefone = telefone.replace(/(\d{4})(\d)/, "$1-$2");
        return telefone;
    }

    function formatarCelular(celular) {
        celular = celular.replace(/\D/g, "");
        if (celular.length > 11) celular = celular.substring(0, 11);
        celular = celular.replace(/^(\d{2})(\d)/g, "($1) $2");
        celular = celular.replace(/(\d{5})(\d)/, "$1-$2");
        return celular;
    }

    cpfInput.addEventListener("input", () => {
        cpfInput.value = formatarCPF(cpfInput.value);
    });

    telefoneInput.addEventListener("input", () => {
        telefoneInput.value = formatarTelefone(telefoneInput.value);
    });

    celularInput.addEventListener("input", () => {
        celularInput.value = formatarCelular(celularInput.value);
    });

    document.querySelectorAll(".excluir-cliente").forEach(botao => {
        botao.addEventListener("click", (evento) => {
            evento.preventDefault();

            const clienteId = botao.getAttribute("data-id");

            if (confirm("Tem certeza que deseja excluir este cliente?")) {
                try {
                    excluirCliente(clienteId); 
                    alert("Cliente excluído com sucesso!");
                    window.location.reload();
                    //carregarClientesNaInterface();
                } catch (error) {
                    console.error("Erro ao excluir cliente:", error.message);
                    alert("Ocorreu um erro ao excluir o cliente.");
                }
            }
        });
    });

    //////////////////////////////////////////////////////
    //////////////EXPORTAR CLIENTES//////////////////////
    ////////////////////////////////////////////////////
   
    document.getElementById("exportarDadosClientes").addEventListener("click", () => {
        try {

            const usuarioLogadoId = localStorage.getItem("usuarioLogadoId");

            const clientesQuery = db.exec(`
                SELECT * FROM clientes WHERE usuarioId = ${usuarioLogadoId}
            `);

            if (clientesQuery.length === 0) {
                throw new Error("Nenhum cliente encontrado para este usuário.");
            }
        
            const clienteIds = clientesQuery.map(cliente => cliente.id);
     
            const enderecosQuery = db.exec(`
                SELECT * FROM enderecos WHERE clienteId IN (${clienteIds.join(",")})
            `);
           
            const dadosExportados = {
                clientes: clientesQuery,
                enderecos: enderecosQuery
            };
           
            const dadosJSON = JSON.stringify(dadosExportados, null, 2);
           
            const blob = new Blob([dadosJSON], { type: "application/json" });
           
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "meus_clientes.json";
            a.click();
          
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Erro ao exportar dados:", error.message);
            alert(error.message || "Ocorreu um erro ao exportar os dados.");
        }
    });

});


//////////////////////////////////////////////
////////////////// CLIENTES /////////////////
////////////////////////////////////////////

export function carregarListaClientes() {
    const tbody = document.querySelector("#listaClientes tbody");
    tbody.innerHTML = "";

    const usuarioLogadoId = localStorage.getItem("usuarioLogadoId");
    const clientes = db.exec(`SELECT * FROM clientes WHERE usuarioId = ${usuarioLogadoId}`);

    if (clientes.length > 0) {
        clientes.forEach(cliente => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td><a class="detalhes-cliente" data-id="${cliente.id}">${cliente.codigo}</td>
                <td><a class="detalhes-cliente" title="Clique para abrir a view" data-id="${cliente.id}">${cliente.nomeCompleto}</a></td>
                <td><a class="detalhes-cliente" data-id="${cliente.id}">${cliente.cpf}</td>
                <td><a class="detalhes-cliente" data-id="${cliente.id}">${cliente.dataNascimento}</td>
                <td><a class="detalhes-cliente" data-id="${cliente.id}">${cliente.telefone}</td>
                <td><a class="detalhes-cliente" data-id="${cliente.id}">${cliente.celular}</td>
                <td>
                    <a class="editar-cliente" title="Editar cliente" data-id="${cliente.id}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil-square" viewBox="0 0 16 16">
                            <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                            <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"/>
                        </svg>
                    </a>
                    <a class="excluir-cliente" title="Excluir cliente" data-id="${cliente.id}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
                            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                            <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                        </svg>
                    </a>
                </td>
            `;

            tbody.appendChild(row);
        });
    } else {
        tbody.innerHTML = "<tr><td colspan='6'>Nenhum cliente cadastrado.</td></tr>";
    }
}

function gerarProximoCodigoCliente(usuarioId) {
    const resultado = db.exec(`
        SELECT MAX(codigo) AS maxCodigo
        FROM clientes
        WHERE usuarioId = ${usuarioId}
    `);

    const maxCodigo = resultado[0]?.maxCodigo || 0;
    return+ maxCodigo + 1;
}

function cadastrarCliente() {
    const nomeCompleto = document.getElementById("nomeCompleto").value.trim();
    const cpf = document.getElementById("cpf").value.trim();
    const dataNascimento = document.getElementById("dataNascimento").value;
    const telefone = document.getElementById("telefone").value.trim();
    const celular = document.getElementById("celular").value.trim();

    const usuarioLogadoId = localStorage.getItem("usuarioLogadoId");
    if (!usuarioLogadoId) {
        alert("Erro: Nenhum usuário logado encontrado.");
        return;
    }

    const usuarioExistsQuery = `SELECT * FROM usuarios WHERE id = ${usuarioLogadoId}`;
    const usuarioExists = db.exec(usuarioExistsQuery);
    if (usuarioExists.length === 0) {
        alert("Erro: Usuário logado não encontrado.");
        return;
    }

    const proximoCodigo = gerarProximoCodigoCliente(usuarioLogadoId);

    const query = `SELECT * FROM clientes WHERE cpf = '${cpf}'`;
    const clienteExistente = db.exec(query);
    if (clienteExistente.length > 0) {
        alert("Já existe um cliente cadastrado com este CPF.");
        return;
    }

    if (!nomeCompleto || !cpf || !dataNascimento || !celular) {
        alert("Erro: Todos os campos obrigatórios devem ser preenchidos.");
        return;
    }

    db.exec(`
        INSERT INTO clientes (codigo, nomeCompleto, cpf, dataNascimento, telefone, celular, usuarioId)
        VALUES (${proximoCodigo}, '${nomeCompleto}', '${cpf}', '${dataNascimento}', '${telefone}', '${celular}', ${usuarioLogadoId})
    `);

    console.log("Cliente inserido com sucesso:", { proximoCodigo, nomeCompleto, cpf, dataNascimento, telefone, celular, usuarioLogadoId });

    alert("Cliente cadastrado com sucesso!");

    document.getElementById("cadastroClienteForm").reset();

    const modal = document.getElementById("cadastroClienteModal");
    if (modal) {
        modal.style.display = "none";
    }

    carregarListaClientes();

    salvarDadosNoLocalStorage();
}

function abrirModalEdicao(clienteId) {

    const query = `SELECT * FROM clientes WHERE id = ${clienteId}`;
    const cliente = db.exec(query)[0];

    if (cliente) {

        document.getElementById("nomeCompleto").value = cliente.nomeCompleto;
        document.getElementById("cpf").value = cliente.cpf;
        document.getElementById("dataNascimento").value = cliente.dataNascimento;
        document.getElementById("telefone").value = cliente.telefone;
        document.getElementById("celular").value = cliente.celular;

        clienteEmEdicao = clienteId;
        modoEdicao = true;


        document.getElementById("cadastroClienteModal").style.display = "flex";
    } else {
        console.error("Cliente não encontrado.");
    }
}

function atualizarCliente() {
    const nomeCompleto = document.getElementById("nomeCompleto").value.trim();
    const cpf = document.getElementById("cpf").value.trim();
    const dataNascimento = document.getElementById("dataNascimento").value;
    const telefone = document.getElementById("telefone").value.trim();
    const celular = document.getElementById("celular").value.trim();

    db.exec(`
        UPDATE clientes
        SET nomeCompleto = '${nomeCompleto}', cpf = '${cpf}', dataNascimento = '${dataNascimento}',
            telefone = '${telefone}', celular = '${celular}'
        WHERE id = ${clienteEmEdicao}
    `);

    alert("Cliente atualizado com sucesso!");
    document.getElementById("cadastroClienteForm").reset();
    document.getElementById("cadastroClienteModal").style.display = "none";

    carregarListaClientes();
    salvarDadosNoLocalStorage();

    clienteEmEdicao = null;
    modoEdicao = false;
}

function limparFormulario() {
    document.getElementById("nomeCompleto").value = "";
    document.getElementById("cpf").value = "";
    document.getElementById("dataNascimento").value = "";
    document.getElementById("telefone").value = "";
    document.getElementById("celular").value = "";

    clienteEmEdicao = null;
    modoEdicao = false;
}

document.getElementById("abrirCadastroClienteBtn").addEventListener("click", () => {
    document.getElementById("cadastroClienteModal").style.display = "flex";
    limparFormulario();
});

document.getElementById("cancelarCadastroClienteBtn").addEventListener("click", () => {
    document.getElementById("cadastroClienteForm").reset();
    document.getElementById("cadastroClienteModal").style.display = "none";
});

document.getElementById("cadastroClienteForm").addEventListener("submit", (e) => {
    e.preventDefault();
    if (modoEdicao) {
        atualizarCliente();
    } else {
        cadastrarCliente();
    }
});

document.querySelector("#listaClientes tbody").addEventListener("click", (e) => {
    const elementoClicado = e.target.closest(".editar-cliente");
    if (elementoClicado) {
        const clienteId = elementoClicado.getAttribute("data-id");
        abrirModalEdicao(clienteId);
    }
});

document.querySelector("#listaClientes tbody").addEventListener("click", (e) => {
    const elementoClicado = e.target.closest(".detalhes-cliente");
    if (elementoClicado) {
        const clienteId = elementoClicado.getAttribute("data-id");
        clienteSelecionado = clienteId;

        const cliente = db.exec(`SELECT * FROM clientes WHERE id = ${clienteId}`)[0];
        document.getElementById("nomeCliente").textContent = cliente.nomeCompleto;
        document.getElementById("cpfCliente").textContent = cliente.cpf;

        carregarEnderecos(clienteId);

        document.getElementById("detalhesClientePopup").style.display = "flex";
    }
});

document.getElementById("fecharPopupBtn").addEventListener("click", () => {
    document.getElementById("detalhesClientePopup").style.display = "none";
});

export function excluirCliente(clienteId) {
    try {
        const clienteQuery = db.exec(`SELECT * FROM clientes WHERE id = ${clienteId}`);
        if (clienteQuery.length === 0) {
            throw new Error("Cliente não encontrado.");
        }

        db.exec(`DELETE FROM enderecos WHERE clienteId = ${clienteId}`);

        db.exec(`DELETE FROM clientes WHERE id = ${clienteId}`);

        salvarDadosNoLocalStorage();

    } catch (error) {
        console.error("Erro ao excluir cliente:", error.message);
        throw error;
    }
}


////////////////////////////////////////////////////////
/////////////// CADASTRO ENDEREÇO //////////////////////
///////////////////////////////////////////////////////

let clienteSelecionado = null;
let enderecoEmEdicao = null;

function adicionarEndereco(clienteId, endereco) {
    validarEnderecoPrincipal(clienteId, endereco);

    db.exec(`
        INSERT INTO enderecos (clienteId, cep, rua, bairro, cidade, estado, pais, principal)
        VALUES (${clienteId}, '${endereco.cep}', '${endereco.rua}', '${endereco.bairro}', 
                '${endereco.cidade}', '${endereco.estado}', '${endereco.pais}', ${endereco.principal})
    `);

    salvarDadosNoLocalStorage();
}

function limparFormularioEndereco() {
    document.getElementById("enderecoId").value = "";
    document.getElementById("cep").value = "";
    document.getElementById("rua").value = "";
    document.getElementById("bairro").value = "";
    document.getElementById("cidade").value = "";
    document.getElementById("estado").value = "";
    document.getElementById("pais").value = "";
    document.getElementById("principal").checked = false;

    enderecoEmEdicao = null;
}

function validarEnderecoPrincipal(clienteId, endereco) {
    try {
        const enderecosDoCliente = db.exec(`
            SELECT id, principal FROM enderecos WHERE clienteId = ${clienteId}
        `);

        if (!enderecosDoCliente || enderecosDoCliente.length === 0) {
            endereco.principal = 1;
            return;
        }

        const enderecoPrincipalExistente = enderecosDoCliente.some(endereco => endereco.principal);

        if (endereco.principal) {
            if (enderecoPrincipalExistente) {
                db.exec(`
                    UPDATE enderecos SET principal = 0 WHERE clienteId = ${clienteId} AND principal = 1
                `);
            }
        } else {
            if (!enderecoPrincipalExistente) {
                endereco.principal = 1;
            }
        }
    } catch (error) {
        console.error("Erro ao validar endereço principal:", error.message);
        throw error;
    }
}

function editarEndereco(enderecoId, endereco) {
    const clienteId = db.exec(`SELECT clienteId FROM enderecos WHERE id = ${enderecoId}`)[0].clienteId;

    validarEnderecoPrincipal(clienteId, endereco);

    db.exec(`
        UPDATE enderecos
        SET cep = '${endereco.cep}', rua = '${endereco.rua}', bairro = '${endereco.bairro}',
            cidade = '${endereco.cidade}', estado = '${endereco.estado}', pais = '${endereco.pais}',
            principal = ${endereco.principal}
        WHERE id = ${enderecoId}
    `);
    salvarDadosNoLocalStorage();
}

function excluirEndereco(enderecoId) {
    const clienteId = db.exec(`SELECT clienteId FROM enderecos WHERE id = ${enderecoId}`)[0].clienteId;

    db.exec(`DELETE FROM enderecos WHERE id = ${enderecoId}`);

    const enderecosDoCliente = db.exec(`
        SELECT id, principal FROM enderecos WHERE clienteId = ${clienteId}
    `);

    const enderecoPrincipalExistente = enderecosDoCliente.some(endereco => endereco.principal);

    if (!enderecoPrincipalExistente && enderecosDoCliente.length > 0) {
        db.exec(`
            UPDATE enderecos SET principal = 1 WHERE id = ${enderecosDoCliente[0].id}
        `);
    }

    salvarDadosNoLocalStorage();
}

document.getElementById("abrirCadastroEnderecoBtn").addEventListener("click", () => {
    limparFormularioEndereco();
    document.getElementById("cadastroEnderecoPopup").style.display = "flex";
});

document.getElementById("cancelarCadastroEnderecoBtn").addEventListener("click", () => {
    limparFormularioEndereco();
    document.getElementById("cadastroEnderecoPopup").style.display = "none";
});

document.addEventListener("DOMContentLoaded", () => {
    const cepInput = document.getElementById("cep");

    function formatarCEP(cep) {
        cep = cep.replace(/\D/g, ""); 
        if (cep.length > 8) cep = cep.substring(0, 8);
        cep = cep.replace(/^(\d{5})(\d)/, "$1-$2"); 
        return cep;
    }
    
    cepInput.addEventListener("input", () => {
        cepInput.value = formatarCEP(cepInput.value);
    });
    
    document.getElementById("cadastroClienteForm").addEventListener("submit", (e) => {
        const cep = cepInput.value.replace(/\D/g, ""); 

        if (cep.length !== 8) {
            e.preventDefault(); 
            return;
        }
    });
});

document.getElementById("cadastroEnderecoForm").addEventListener("submit", (e) => {
    e.preventDefault();

    const cep = document.getElementById("cep").value.trim();
    const rua = document.getElementById("rua").value.trim();
    const bairro = document.getElementById("bairro").value.trim();
    const cidade = document.getElementById("cidade").value.trim();
    const estado = document.getElementById("estado").value.trim();
    const pais = document.getElementById("pais").value.trim();
    const principal = document.getElementById("principal").checked;

    if (!cep || !rua || !bairro || !cidade || !estado || !pais) {
        alert("Por favor, preencha todos os campos obrigatórios.");
        return;
    }

    const endereco = {
        cep,
        rua,
        bairro,
        cidade,
        estado,
        pais,
        principal
    };

    if (enderecoEmEdicao) {
        editarEndereco(enderecoEmEdicao, endereco);
    } else {
        adicionarEndereco(clienteSelecionado, endereco);
    }

    alert("Endereço salvo com sucesso!");
    limparFormularioEndereco();
    salvarDadosNoLocalStorage();
    carregarEnderecos(clienteSelecionado);
    document.getElementById("cadastroEnderecoPopup").style.display = "none";
});

document.querySelector("#listaEnderecos tbody").addEventListener("click", (e) => {
    const elementoClicado = e.target.closest(".excluir-endereco");
    if (elementoClicado) {
        const enderecoId = elementoClicado.getAttribute("data-id");

        if (confirm("Tem certeza que deseja excluir este endereço?")) {
            excluirEndereco(enderecoId);
            salvarDadosNoLocalStorage();
            carregarEnderecos(clienteSelecionado);
        }
    }
});

function carregarEnderecos(clienteId) {
    const enderecos = db.exec(`SELECT * FROM enderecos WHERE clienteId = ${clienteId}`);
    const tbody = document.querySelector("#listaEnderecos tbody");
    tbody.innerHTML = "";

    if (enderecos.length > 0) {
        enderecos.forEach(endereco => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${endereco.cep}</td>
                <td>${endereco.rua}</td>
                <td>${endereco.bairro}</td>
                <td>${endereco.cidade}</td>
                <td>${endereco.estado}</td>
                <td>${endereco.pais}</td>
                <td>${endereco.principal ? "Sim" : "Não"}</td>
                <td>
                    <a class="editar-endereco" title="Editar endereço" data-id="${endereco.id}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil-square" viewBox="0 0 16 16">
                            <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                            <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"/>
                        </svg>
                    </a>
                    <a class="excluir-endereco"  title="Excluir endereço" data-id="${endereco.id}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
                            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                            <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                        </svg>
                    </a>
                </td>
            `;

            tbody.appendChild(row);
        });
    } else {
        tbody.innerHTML = "<tr><td colspan='8'>Nenhum endereço cadastrado.</td></tr>";
    }
}

document.querySelector("#listaEnderecos tbody").addEventListener("click", (e) => {
    const elementoClicado = e.target.closest(".editar-endereco");
    if (elementoClicado) {
        const enderecoId = elementoClicado.getAttribute("data-id");

        const query = `SELECT * FROM enderecos WHERE id = ${enderecoId}`;
        const endereco = db.exec(query)[0];

        if (endereco) {

            document.getElementById("enderecoId").value = endereco.id;
            document.getElementById("cep").value = endereco.cep;
            document.getElementById("rua").value = endereco.rua;
            document.getElementById("bairro").value = endereco.bairro;
            document.getElementById("cidade").value = endereco.cidade;
            document.getElementById("estado").value = endereco.estado;
            document.getElementById("pais").value = endereco.pais;
            document.getElementById("principal").checked = endereco.principal;

            enderecoEmEdicao = enderecoId;

            document.getElementById("cadastroEnderecoPopup").style.display = "flex";
        } else {
            console.error("Endereço não encontrado.");
        }
    }
});


