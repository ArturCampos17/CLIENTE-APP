
export const db = new alasql.Database("clienteEnderecoDB");

export function resetarBancoDeDados() {
    try {

        db.exec("DROP TABLE IF EXISTS usuarios");
        db.exec("DROP TABLE IF EXISTS clientes");
        db.exec("DROP TABLE IF EXISTS enderecos");

        localStorage.removeItem("clienteEnderecoDB");
        localStorage.removeItem("usuarioLogadoId");

        console.log("Banco de dados e localStorage foram resetados com sucesso.");
    } catch (error) {
        console.error("Erro ao resetar o banco de dados:", error.message);
        throw error;
    }
}

export function criarTabelas() {
    db.exec(`
        CREATE TABLE IF NOT EXISTS usuarios (
            id INT AUTO_INCREMENT,
            usuario STRING UNIQUE,
            senha STRING,
            PRIMARY KEY (id)
        )
    `);

    db.exec(`
        CREATE TABLE IF NOT EXISTS clientes (
            id INT AUTO_INCREMENT,
            codigo INT,
            nomeCompleto STRING,
            cpf STRING UNIQUE,
            dataNascimento STRING,
            telefone STRING,
            celular STRING,
            usuarioId INT,
            PRIMARY KEY (id),
            FOREIGN KEY (usuarioId) REFERENCES usuarios(id)
        )
    `);

    db.exec(`
        CREATE TABLE IF NOT EXISTS enderecos (
            id INT AUTO_INCREMENT,
            clienteId INT,
            cep STRING,
            rua STRING,
            bairro STRING,
            cidade STRING,
            estado STRING,
            pais STRING,
            principal BOOLEAN,
            PRIMARY KEY (id),
            FOREIGN KEY (clienteId) REFERENCES clientes(id)
        )
    `);
}

export function salvarDadosNoLocalStorage() {
    const usuarios = db.exec("SELECT * FROM usuarios");
    const clientes = db.exec("SELECT * FROM clientes");
    const enderecos = db.exec("SELECT * FROM enderecos");
 
    const usuariosValidos = usuarios.filter(usuario => usuario.usuario && usuario.senha);
    const clientesValidos = clientes.filter(cliente => cliente.nomeCompleto && cliente.cpf);
    const enderecosValidos = enderecos.filter(endereco => endereco.clienteId && endereco.cep && endereco.rua);

    if (usuariosValidos.length === 0 && clientesValidos.length === 0 && enderecosValidos.length === 0) {
        console.warn("Nenhum dado válido encontrado para salvar no localStorage.");
        return;
    }
    
    const data = {
        usuarios: usuariosValidos,
        clientes: clientesValidos,
        enderecos: enderecosValidos
    };

    localStorage.setItem("clienteEnderecoDB", JSON.stringify(data));;
}

export function carregarDadosDoLocalStorage() {
    const savedData = localStorage.getItem("clienteEnderecoDB");
    if (savedData) {
        try {
            const data = JSON.parse(savedData);

        
            if (data.usuarios && data.usuarios.length > 0) {
                const usuariosValidos = data.usuarios.filter(usuario => usuario.usuario && usuario.senha);

                if (usuariosValidos.length > 0) {
                    db.exec("DELETE FROM usuarios"); 

                    usuariosValidos.forEach(usuario => {
                        db.exec(`INSERT INTO usuarios (usuario, senha) VALUES ('${usuario.usuario}', '${usuario.senha}')`);
                    });

                } else {
                    console.warn("Nenhum dado válido de usuário encontrado no localStorage.");
                }
            } else {
                console.warn("Nenhum dado de usuário encontrado no localStorage.");
            }

            if (data.clientes && data.clientes.length > 0) {
                const clientesValidos = data.clientes.filter(cliente => cliente.nomeCompleto && cliente.cpf && cliente.usuarioId);
            
                if (clientesValidos.length > 0) {
                    db.exec("DELETE FROM clientes");
            
                    clientesValidos.forEach(cliente => {
                        
                        const usuarioExistsQuery = `SELECT * FROM usuarios WHERE id = ${cliente.usuarioId}`;
                        const usuarioExists = db.exec(usuarioExistsQuery);
            
                        if (usuarioExists.length > 0) {
                            db.exec(`
                                INSERT INTO clientes (codigo,nomeCompleto, cpf, dataNascimento, telefone, celular, usuarioId)
                                VALUES (${cliente.id},'${cliente.nomeCompleto}', '${cliente.cpf}', '${cliente.dataNascimento}', '${cliente.telefone}', '${cliente.celular}', ${cliente.usuarioId})
                            `);
                        } else {
                            console.warn(`Cliente ignorado: usuarioId ${cliente.usuarioId} não encontrado.`);
                        }
                    });
                } else {
                    console.warn("Nenhum dado válido de cliente encontrado no localStorage.");
                }
            }
            
            if (data.enderecos && data.enderecos.length > 0) {
                db.exec("DELETE FROM enderecos");
            
                data.enderecos.forEach(endereco => {
                    
                    const clienteExistsQuery = `SELECT * FROM clientes WHERE id = ${endereco.clienteId}`;
                    const clienteExists = db.exec(clienteExistsQuery);
            
                    if (clienteExists.length > 0) {
                        db.exec(`
                            INSERT INTO enderecos (clienteId, cep, rua, bairro, cidade, estado, pais, principal)
                            VALUES (${endereco.clienteId}, '${endereco.cep}', '${endereco.rua}', '${endereco.bairro}', '${endereco.cidade}', '${endereco.estado}', '${endereco.pais}', ${endereco.principal})
                        `);
                    } else {
                        console.warn(`Endereço ignorado: clienteId ${endereco.clienteId} não encontrado.`);
                    }
                });
            }
            const usuarios = db.exec("SELECT * FROM usuarios");
            console.log("Usuários:", usuarios);
    
            const clientes = db.exec("SELECT * FROM clientes");
            console.log("Clientes:", clientes);
    
            const enderecos = db.exec("SELECT * FROM enderecos");
            console.log("Endereços:", enderecos);
        } catch (error) {
            console.error("Erro ao carregar dados do localStorage:", error);
        }
    } else {
        console.log("Nenhum dado encontrado no localStorage.");
    }
}

export function cadastrarUsuario(usuario, senha) {
    const query = `SELECT * FROM usuarios WHERE usuario = '${usuario}'`;
    const userExists = db.exec(query);

    if (userExists.length > 0) {
        throw new Error("Este usuário já está cadastrado.");
    }

    db.exec(`INSERT INTO usuarios (usuario, senha) VALUES ('${usuario}', '${senha}')`);
}

export function autenticarUsuario(usuario, senha) {

    const query = `SELECT * FROM usuarios WHERE usuario = '${usuario}' AND senha = '${senha}'`;
    const user = db.exec(query);

    if (user.length === 0) {
        throw new Error("Usuário ou senha inválidos.");
    }
   
    const usuarioLogadoId = user[0].id;
    localStorage.setItem("usuarioLogadoId", usuarioLogadoId);

    return user[0]; 
}