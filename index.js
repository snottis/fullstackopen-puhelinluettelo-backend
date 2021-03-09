require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const ObjectID = require('mongodb').ObjectID;

const Person = require('./models/person');
morgan.token('body', function (req, res) {
  return JSON.stringify(req.body);
});

const app = express();

app.use(express.json());
app.use(
  morgan((tokens, req, res) => {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, 'content-length'),
      '-',
      tokens['response-time'](req, res),
      'ms',
      tokens.body(req, res),
    ].join(' ');
  })
);
app.use(express.static('build'));

app.post('/api/persons', (req, res, next) => {
  newId = Math.floor(Math.random() * 100000);
  body = req.body;
  if (!body.name || !body.number) {
    res.status(400);
    res.json({ error: 'must include name and number' });
    return;
  }
  const person = new Person({
    name: body.name,
    number: body.number,
  });
  person
    .save()
    .then((saved) => {
      res.json(saved);
    })
    .catch((err) => next(err));
});

app.get('/api/persons', (req, res) => {
  Person.find({}).then((data) => {
    res.json(data);
  });
});

app.put('/api/persons/:id', (req, res, next) => {
  body = req.body;
  if (body.number && body.name) {
    Person.findByIdAndUpdate(
      req.params.id,
      { number: body.number },
      { new: true }
    )
      .then((data) => {
        if (!data) {
          return res.status(404).json({ error: 'already removed' });
        }
        res.json(data);
      })
      .catch((err) => {
        next(err);
      });
  } else {
    res.status(400).json({ error: 'must include name and number' });
  }
});

app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndRemove(req.params.id)
    .then((data) => {
      res.status(204).end();
    })
    .catch((err) => next(err));
});

app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
    .then((data) => {
      if (!data) {
        res.status(404).end();
      }
      res.json(data);
    })
    .catch((err) => {
      next(err);
      res.status(400).send({ error: 'malformatted id' });
    });
});
app.get('/info', (req, res) => {
  Person.countDocuments({}).then((size) => {
    res.send(`Phonebook has info for ${size} people <br/><br/>
        ${Date(Date.now()).toString()}`);
  });
});

const errorHandler = (err, req, res, next) => {
  console.error(err.message);
  if (err.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' });
  }
  if (err.name === 'ValidationError') {
    return res.status(400).send({ error: err.message });
  }
  next(err);
};

app.use(errorHandler);

app.listen(process.env.PORT || 3001);
