const express = require('express');
const menuRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const issuesRouter = require('./issues.js');

menuRouter.param('menuId', (req, res, next, menuId) => {
  const sql = 'SELECT * FROM Menu WHERE Menu.id = $MenuId';
  const values = {$menuId: menuId};
  db.get(sql, values, (error, menu) => {
    if (error) {
      next(error);
    } else if (menu) {
      req.menu = menu;
      next();
    } else {
      res.sendStatus(404);
    }
  });
});

menuRouter.use('/:menuId/issues', issuesRouter);

menuRouter.get('/', (req, res, next) => {
  db.all('SELECT * FROM Menu', (err, menu) => {
    if (err) {
      next(err);
    } else {
      res.status(200).json({menu: menu});
    }
  });
});

menuRouter.get('/:menuId', (req, res, next) => {
  res.status(200).json({menu: req.menu});
});

menuRouter.post('/', (req, res, next) => {
  const name = req.body.menu.name,
        description = req.body.menu.description;
  if (!name || !description) {
    return res.sendStatus(400);
  }

  const sql = 'INSERT INTO Menu (name, description) VALUES ($name, $description)';
  const values = {
    $name: name,
    $description: description
  };

  db.run(sql, values, function(error) {
    if (error) {
      next(error);
    } else {
      db.get(`SELECT * FROM Menu WHERE Menu.id = ${this.lastID}`,
        (error, menu) => {
          res.status(201).json({menu: menu});
        });
    }
  });
});

menuRouter.put('/:menuId', (req, res, next) => {
  const name = req.body.menu.name,
        description = req.body.menu.description;
  if (!name || !description) {
    return res.sendStatus(400);
  }

  const sql = 'UPDATE Menu SET name = $name, description = $description ' +
      'WHERE Menu.id = $menuId';
  const values = {
    $name: name,
    $description: description,
    $menuId: req.params.menuId
  };

  db.run(sql, values, (error) => {
    if (error) {
      next(error);
    } else {
      db.get(`SELECT * FROM Menu WHERE Menu.id = ${req.params.menuId}`,
        (error, menu) => {
          res.status(200).json({menu: menu});
        });
    }
  });
});

menuRouter.delete('/:menuId', (req, res, next) => {
  const issueSql = 'SELECT * FROM Issue WHERE Issue.menu_id = $menuId';
  const issueValues = {$menuId: req.params.menuId};
  db.get(issueSql, issueValues, (error, issue) => {
    if (error) {
      next(error);
    } else if (issue) {
      res.sendStatus(400);
    } else {
      const deleteSql = 'DELETE FROM Menu WHERE Menu.id = $menuId';
      const deleteValues = {$menuId: req.params.menuId};

      db.run(deleteSql, deleteValues, (error) => {
        if (error) {
          next(error);
        } else {
          res.sendStatus(204);
        }
      });
    }
  });
});

module.exports = menuRouter;
