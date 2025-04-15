
## **1. Visão Geral**
Este sistema é uma aplicação web desenvolvida para gerenciar clientes e seus endereços associados a usuários específicos. Ele permite:

- Cadastro de usuários.
- Login de usuários.
- Cadastro, edição, exclusão e exportação de clientes (com código sequencial).
- Importação de usuários em formato JSON.
- Exportação dos dados de clientes em formato JSON.

A aplicação utiliza:
- **AlaSQL** como banco de dados em memória.
- **LocalStorage** para persistência de dados.
- **HTML, CSS e JavaScript** para a interface e lógica.

---

## **2. Pré-requisitos**
Antes de executar o sistema, certifique-se de que você tenha os seguintes requisitos instalados:

### **2.1 Ferramentas Necessárias**
- Um navegador moderno (Google Chrome, Firefox, Edge, etc.).
- Um editor de texto ou IDE (ex.: VS Code) para visualizar/editar os arquivos, caso necessário.

### **2.2 Estrutura do Projeto**
O projeto deve estar organizado da seguinte forma:

```
/CLIENTE-APP
│
├── index.html 
├── clientes.html 
├── css
│   ├── clientes.css
│   └── styles.css
├── data
│   └── db_prepopulado.json
├── js
│   ├── app.js
│   ├── clientes.js
│   ├── database.js
└── INFO.txt
```

---

## **3. Configuração Inicial**

### **3.1 Baixar o Projeto**
Faça o download do projeto em formato `.zip` ou clone o repositório (se disponível).

### **3.2 Abrir o Sistema**
1. Descompacte o arquivo `.zip` (se aplicável).
2. Abra o arquivo `index.html` no navegador:
   - Clique duas vezes no arquivo ou arraste-o para uma janela do navegador.
   - Alternativamente, use um servidor local (como Live Server no VS Code) para evitar problemas com o `localStorage`.

---

## **4. Funcionalidades do Sistema**

### **4.1 Login de Usuário**
1. Acesse a página inicial (`index.html`).
2. Insira suas credenciais de usuário (usuário e senha) no formulário de login.
3. Caso não haja usuários cadastrados, use a função de criação de usuário padrão para adicionar um novo usuário.

#### **Usuário Padrão (opcional):**
- **Usuário:** admin  
- **Senha:** 123456

### **4.2 Cadastro de Clientes**
1. Após fazer login, acesse a tela de cadastro de clientes.
2. Preencha os campos obrigatórios (nome completo, CPF, data de nascimento, telefone, celular).
3. O sistema automaticamente atribuirá um código sequencial ao cliente.
4. Clique em "Cadastrar" para salvar o cliente.

### **4.3 Listagem de Clientes**
1. Após cadastrar clientes, eles serão exibidos em uma lista na tela.
2. É possível editar ou excluir clientes diretamente da lista.
3. Clicando sobre o nome do cliente, abrirá uma view onde será possível adicionar endereço ao cliente.
4. A view do cliente segue os mesmos requisitos do cliente, podendo editar, atribuir endereço principal ou excluir endereço diretamente da lista.

### **4.4 Exportação de Dados**
1. Clique no botão "Exportar meus clientes".
2. Um arquivo JSON será baixado automaticamente, contendo os dados dos clientes e seus endereços associados.

### **4.5 Logout**
1. Clique no botão "Sair" para encerrar a sessão.
2. O sistema limpará os dados do usuário logado e retornará à tela de login.

---

## **5. Estrutura do Banco de Dados**

### **Tabela: usuarios**
| Campo     | Tipo       | Descrição                     |
|-----------|------------|-------------------------------|
| id        | INT        | ID único do usuário           |
| usuario   | STRING     | Nome de usuário               |
| senha     | STRING     | Senha do usuário              |

---

### **Tabela: clientes**
| Campo          | Tipo       | Descrição                           |
|----------------|------------|-------------------------------------|
| id             | INT        | ID único do cliente                 |
| codigo         | INT        | Código sequencial do cliente        |
| nomeCompleto   | STRING     | Nome completo do cliente            |
| cpf            | STRING     | CPF do cliente                      |
| dataNascimento | STRING     | Data de nascimento do cliente       |
| telefone       | STRING     | Telefone do cliente                 |
| celular        | STRING     | Celular do cliente                  |
| usuarioId      | INT        | ID do usuário associado ao cliente  |

---

### **Tabela: enderecos**
| Campo    | Tipo       | Descrição                           |
|----------|------------|-------------------------------------|
| id       | INT        | ID único do endereço                |
| clienteId| INT        | ID do cliente associado ao endereço |
| cep      | STRING     | CEP do endereço                     |
| rua      | STRING     | Rua do endereço                     |
| bairro   | STRING     | Bairro do endereço                  |
| cidade   | STRING     | Cidade do endereço                  |
| estado   | STRING     | Estado do endereço                  |
| pais     | STRING     | País do endereço                    |
| principal| BOOLEAN    | Indica se é o endereço principal    |

---

## **6. Considerações Finais**
- Certifique-se de que o navegador permita o uso do `localStorage`. Alguns navegadores no modo privado podem bloquear essa funcionalidade.
- Caso encontre problemas, revise o console do navegador (F12) para identificar erros.
- Para dúvidas ou suporte, entre em contato com o desenvolvedor.
