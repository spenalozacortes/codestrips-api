const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const sqlite3 = require('sqlite3');

const app = express();
const db = new sqlite3.Database(process.env.TEST_DATABASE || './db.sqlite');
const PORT = process.env.PORT || 4001;

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(morgan('dev'));

app.get('/strips', (req, res, next) => {
  db.all("SELECT * FROM Strip", (error, rows) => {
    res.send({ strips: rows });
  });
});

app.post('/strips', (req, res, next) => {
  const { head, body, background, bubbleType, bubbleText, caption } = req.body.strip;

  if (head && body && background && bubbleType) {
    db.run("INSERT INTO Strip (head, body, background, bubble_type, bubble_text, caption) VALUES ($head, $body, $background, $bubbleType, $bubbleText, $caption)", {
      $head: head,
      $body: body,
      $background: background,
      $bubbleType: bubbleType,
      $bubbleText: bubbleText,
      $caption: caption
    }, function(error) {
      if (error) {
        return res.status(500).send();
      }
      db.get(`SELECT * FROM Strip WHERE id = ${this.lastID}`, (error, row) => {
        if (error) {
          return res.status(500).send();
        }
        res.status(201).send({ strip: row });
      });
    });
  } else {
    res.status(400).send();
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

module.exports = app;