const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
app.use(bodyParser.json());

const HTTP_OK_STATUS = 200;
const PORT = '3000';

app.get('/talker', (req, res) => {
  const talker = JSON.parse(fs.readFileSync('talker.json'));
  if (talker.length === 0) return res.json([]);
  res.json(talker);
});

app.get('/talker/:id', (req, res) => {
  const talker = JSON.parse(fs.readFileSync('talker.json'));
  const { id } = req.params;
  const selectedTalker = talker.find((t) => t.id === parseInt(id, 10));
  if (!selectedTalker) {
    return res.status(404).json({ message: 'Pessoa palestrante não encontrada' });
  }
  res.status(200).json(selectedTalker);
});

// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send();
});

app.listen(PORT, () => {
  console.log('Online');
});
