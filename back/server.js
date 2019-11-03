const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json()); // for parsing application/json
const cors = require('cors');
const request = require('request');
require('dotenv').config();
const { Client } = require('pg')
const client = new Client()
client.connect()
const fs = require('fs');
const {parse, stringify} = require('flatted/cjs');


const corsOptions =  {
  origin: 'http://localhost:3000'
};

app.use(cors(corsOptions));

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Expose-Headers", "X-Total-Count, Content-Range");
    next();
});

app.get('/api/items', function(req, res) {
  const text = `SELECT *
  FROM items`;
  const values = [];
  client.query(text, values, (err, results) => {
    if (err) {
      res.setHeader('Content-Range', 'items 0-0/0');
      res.json([]);
    } else {
      res.setHeader('Content-Range', '0-' + results.rows.length + '/' + results.rows.length);
      res.json(results.rows);
    }
  });
});

app.get('/api/items/:item_id', function(req, res) {
  const text = `SELECT *
  FROM items WHERE id=$1`;
  const values = [req.item_id];
  client.query(text, values, (err, results) => {
    if (err) {
      res.json({data: []});
    } else {
      res.json({data: results.rows});
    }
  });
});

app.post('/api/items', function(req, res) {
  const text = `INSERT INTO items (id, title, description) VALUES(Default, $1, $2)`;
  const values = [req.body.title, req.body.description];
  client.query(text, values, (err, results) => {
    if (err) {
      res.json({data: []});
    } else {
      res.json({data: results.rows});
    }
  });
});

app.delete('/api/items/:item_id', function(req, res) {
  const text = `DELETE
  FROM items WHERE id=$1`;
  const values = [req.item_id];
  client.query(text, values, (err, results) => {
    if (err) {
      res.json({data: []});
    } else {
      res.json({data: results.rows});
    }
  });
});

app.use(function(err, req, res, next){
  console.error(err.stack);
  return res.status(err.status).json({ message: err.message });
});

app.listen(3010);
console.log('Listening on http://localhost:3010');