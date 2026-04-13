cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});
const express = require('express');
const { engine } = require('express-handlebars');
const path = require('path');
const bodyParser = require('body-parser');
const multer = require('multer');

const db = require('./db/conn');
const Filme = require('./db/Filme');

const aplicacao = express();

// Configuração do Multer
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'filmes',
    allowed_formats: ['jpg', 'png', 'jpeg']
  }
});

const upload = multer({ storage });

// Body parser
aplicacao.use(bodyParser.urlencoded({ extended: false }));
aplicacao.use(bodyParser.json());

// Configurar pasta de views
aplicacao.set('views', path.join(__dirname, 'views'));

// Configurar Handlebars
aplicacao.engine(
  'handlebars',
  engine({
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views', 'layouts'),
  })
);

aplicacao.set('view engine', 'handlebars');

// Configurar arquivos estáticos
aplicacao.use(express.static(path.join(__dirname, 'public')));

// Testar conexão com banco e sincronizar modelos
db.authenticate()
  .then(() => {
    console.log('Conectado ao banco com sucesso');
    return db.sync(); // Sincroniza os modelos com o banco de dados
  })
  .then(async () => {
    console.log('Modelos sincronizados com sucesso');
    
    try {
      // Seed inicial: Adiciona o Toy Story 5 se o banco estiver vazio
      const count = await Filme.count();
      console.log(`Filmes no banco: ${count}`);
      
      if (count === 0) {
        await Filme.create({
          titulo: 'ToyStore 5',
          descricao: 'O trabalho de Buzz, Woody, Jessie e do resto da turma fica exponencialmente mais difícil quando eles enfrentam uma nova ameaça na hora da brincadeira.',
          diretor: 'Andrew Stanton',
          dataLancamento: '18 de junho de 2026 (Brasil)',
          genero: 'Animação, Comédia, Aventura, Familiar',
          imagem: '/assets/Filme2.png',
          trailer: 'https://youtu.be/-YbiBclEEgo?si=QfLoxTyTVVKXRM08'
        });
        console.log('Filme inicial adicionado ao banco');
      }
    } catch (erroSeed) {
      console.log('Erro ao executar seed inicial:', erroSeed);
    }
  })
  .catch((erro) => {
    console.log('Erro ao conectar ou sincronizar no banco:', erro);
  });

// Rota principal
aplicacao.get('/', async (requisicao, resposta) => {
  try {
    const filmesBrutos = await Filme.findAll();
    console.log(`Buscando filmes do banco. Total encontrado: ${filmesBrutos.length}`);
    // Convertendo para objeto simples para o Handlebars
    const filmes = filmesBrutos.map(filme => filme.get({ plain: true }));
    resposta.render('filmes', { filmes });
  } catch (erro) {
    console.log('Erro ao buscar filmes:', erro);
    resposta.redirect('/cadastro');
  }
});

// Rota cadastro
aplicacao.get('/cadastro', (requisicao, resposta) => {
  resposta.render('cadastro');
});

// Rota para processar o cadastro do filme
aplicacao.post('/filmes', upload.single('foto'), async (requisicao, resposta) => {
  try {
    const { titulo, diretor, genero, lancamento, sinopse, trailer } = requisicao.body;

    // Validação simples de campos obrigatórios
    if (!titulo || !diretor || !genero || !lancamento || !sinopse) {
      console.log('Dados incompletos no cadastro de filme:', requisicao.body);
      return resposta.status(400).send('Por favor, preencha todos os campos obrigatórios.');
    }

    
    const imagem = requisicao.file ? requisicao.file.path : '/assets/Filme2.png';

    await Filme.create({
      titulo,
      diretor,
      genero,
      dataLancamento: lancamento,
      imagem,
      descricao: sinopse,
      trailer: trailer || ''
    });

    resposta.redirect('/');
  } catch (erro) {
    console.log('Erro ao cadastrar filme:', erro);
    resposta.status(500).send('Erro interno ao cadastrar o filme. Tente novamente.');
  }
});

// Rota para remover filme
aplicacao.post('/filmes/remover/:id', async (requisicao, resposta) => {
  try {
    const idParaRemover = requisicao.params.id;
    await Filme.destroy({ where: { id: idParaRemover } });
    resposta.redirect('/');
  } catch (erro) {
    console.log('Erro ao remover filme:', erro);
    resposta.redirect('/');
  }
});


module.exports = aplicacao;