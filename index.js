const express = require('express');
const app = express();
app.use(express.json());

// ---------- "Bancos" em memória ----------
let clientes = [
  { id: 1, nome: 'Ana Souza', email: 'ana@email.com', telefone: '55999990000', ativo: true },
];
let categorias = [
  { id: 1, nome: 'Eletrônicos', descricao: 'Aparelhos e acessórios' },
];
let fornecedores = [
  { id: 1, razaoSocial: 'Tech Ltda', cnpj: '12345678000199', contato: 'contato@tech.com' },
];
let produtos = [];

// ---------- CLIENTES ----------
app.get('/clientes', (req, res) => res.json(clientes));

app.get('/clientes/:id', (req, res) => {
  const cliente = clientes.find(c => c.id === Number(req.params.id));
  if (!cliente) return res.status(404).json({ erro: 'Cliente não encontrado' });
  res.json(cliente);
});

app.post('/clientes', (req, res) => {
  const { nome, email, telefone, ativo } = req.body;

  if (!nome || !email) {
    return res.status(400).json({ erro: 'nome e email são obrigatórios' });
  }
  if (clientes.some(c => c.email === email)) {
    return res.status(409).json({ erro: 'Já existe cliente com esse email' });
  }

  const novo = {
    id: clientes.length ? clientes[clientes.length - 1].id + 1 : 1,
    nome,
    email,
    telefone: telefone || '',
    ativo: ativo ?? true,
  };
  clientes.push(novo);
  res.status(201).json(novo);
});

app.put('/clientes/:id', (req, res) => {
  const cliente = clientes.find(c => c.id === Number(req.params.id));
  if (!cliente) return res.status(404).json({ erro: 'Cliente não encontrado' });

  const { nome, email, telefone, ativo } = req.body;

  // email não pode repetir em OUTRO cliente
  if (email && clientes.some(c => c.email === email && c.id !== cliente.id)) {
    return res.status(409).json({ erro: 'Email já usado por outro cliente' });
  }

  if (nome !== undefined) cliente.nome = nome;
  if (email !== undefined) cliente.email = email;
  if (telefone !== undefined) cliente.telefone = telefone;
  if (ativo !== undefined) cliente.ativo = ativo;

  res.json(cliente);
});

app.delete('/clientes/:id', (req, res) => {
  const index = clientes.findIndex(c => c.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ erro: 'Cliente não encontrado' });
  clientes.splice(index, 1);
  res.status(204).send();
});

// ---------- CATEGORIAS ----------
app.get('/categorias', (req, res) => res.json(categorias));

app.get('/categorias/:id', (req, res) => {
  const cat = categorias.find(c => c.id === Number(req.params.id));
  if (!cat) return res.status(404).json({ erro: 'Categoria não encontrada' });
  res.json(cat);
});

app.post('/categorias', (req, res) => {
  const { nome, descricao } = req.body;
  if (!nome) return res.status(400).json({ erro: 'nome é obrigatório' });

  const nova = {
    id: categorias.length ? categorias[categorias.length - 1].id + 1 : 1,
    nome,
    descricao: descricao || '',
  };
  categorias.push(nova);
  res.status(201).json(nova);
});

app.put('/categorias/:id', (req, res) => {
  const cat = categorias.find(c => c.id === Number(req.params.id));
  if (!cat) return res.status(404).json({ erro: 'Categoria não encontrada' });

  const { nome, descricao } = req.body;
  if (nome !== undefined) cat.nome = nome;
  if (descricao !== undefined) cat.descricao = descricao;
  res.json(cat);
});

app.delete('/categorias/:id', (req, res) => {
  const index = categorias.findIndex(c => c.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ erro: 'Categoria não encontrada' });
  categorias.splice(index, 1);
  res.status(204).send();
});

// ---------- FORNECEDORES ----------
app.get('/fornecedores', (req, res) => res.json(fornecedores));

app.get('/fornecedores/:id', (req, res) => {
  const f = fornecedores.find(f => f.id === Number(req.params.id));
  if (!f) return res.status(404).json({ erro: 'Fornecedor não encontrado' });
  res.json(f);
});

app.post('/fornecedores', (req, res) => {
  const { razaoSocial, cnpj, contato } = req.body;

  if (!razaoSocial || !cnpj) {
    return res.status(400).json({ erro: 'razaoSocial e cnpj são obrigatórios' });
  }
  if (String(cnpj).length !== 14) {
    return res.status(400).json({ erro: 'CNPJ deve ter 14 caracteres' });
  }

  const novo = {
    id: fornecedores.length ? fornecedores[fornecedores.length - 1].id + 1 : 1,
    razaoSocial,
    cnpj,
    contato: contato || '',
  };
  fornecedores.push(novo);
  res.status(201).json(novo);
});

app.put('/fornecedores/:id', (req, res) => {
  const f = fornecedores.find(f => f.id === Number(req.params.id));
  if (!f) return res.status(404).json({ erro: 'Fornecedor não encontrado' });

  const { razaoSocial, cnpj, contato } = req.body;
  if (cnpj !== undefined && String(cnpj).length !== 14) {
    return res.status(400).json({ erro: 'CNPJ deve ter 14 caracteres' });
  }

  if (razaoSocial !== undefined) f.razaoSocial = razaoSocial;
  if (cnpj !== undefined) f.cnpj = cnpj;
  if (contato !== undefined) f.contato = contato;
  res.json(f);
});

app.delete('/fornecedores/:id', (req, res) => {
  const index = fornecedores.findIndex(f => f.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ erro: 'Fornecedor não encontrado' });
  fornecedores.splice(index, 1);
  res.status(204).send();
});

// ---------- PRODUTOS (valida categoria) ----------
app.get('/produtos', (req, res) => res.json(produtos));

app.post('/produtos', (req, res) => {
  const { nome, preco, categoriaId } = req.body;

  if (!nome || preco === undefined || categoriaId === undefined) {
    return res.status(400).json({ erro: 'nome, preco e categoriaId são obrigatórios' });
  }
  if (!categorias.some(c => c.id === Number(categoriaId))) {
    return res.status(400).json({ erro: 'Categoria informada não existe' });
  }

  const novo = {
    id: produtos.length ? produtos[produtos.length - 1].id + 1 : 1,
    nome,
    preco,
    categoriaId: Number(categoriaId),
  };
  produtos.push(novo);
  res.status(201).json(novo);
});

// ---------- Subir servidor ----------
app.listen(3000, () => console.log('API rodando em http://localhost:3000'));