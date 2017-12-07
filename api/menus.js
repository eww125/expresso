const express = require('express');
const menusRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const menu_itemsRouter = require('./menu_items.js');

menusRouter.param('menuId', (req, res, next, menuId) => {
  console.log('made it to menusRouter.param menuId')
  //console.log('menuId=' + menuId)
  //console.log('Object.keys(req)=' + Object.keys(req))
  //console.log(next)
  const sql = 'SELECT * FROM Menu WHERE Menu.id = $menuId';
  const values = {$menuId: menuId};
  //console.log('sql=' + sql)
  //console.log('values=' + values)
  //console.log('Object.keys(values)=' + Object.keys(values))
  //console.log('values.$menuId=' + values.$menuId)
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

menusRouter.use('/:menuId/menu_items', menu_itemsRouter);

menusRouter.get('/', (req, res, next) => {
  console.log('made it to menusRouter.get/')
  db.all('SELECT * FROM Menu',
    (err, menus) => {
      if (err) {
        next(err);
      } else {
        res.status(200).json({menus: menus});
      }
    });
});

menusRouter.get('/:menuId', (req, res, next) => {
  console.log('made it to menusRouter.get/:menuId')
  res.status(200).json({menu: req.menu});
});

menusRouter.post('/', (req, res, next) => {
  console.log('made it to menusRouter.post/')
  console.log('menusRouter.post/')
  const title = req.body.menu.title
  if (!title) {
    return res.sendStatus(400);
  }

  const sql = 'INSERT INTO Menu (title, id)' +
      'VALUES ($title, $id)';
  const values = {
    $title: title
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

menusRouter.put('/:menuId', (req, res, next) => {
  console.log('made it to menusRouter.put:/menuId')
  console.log('menusRouter.put/')
  console.log('menuId=' + req.params.menuId)
  const title = req.body.menu.title
  if (!title) {
    return res.sendStatus(400);
  }

  const sql = 'UPDATE Menu SET title = $title ' +
      'WHERE Menu.id = $menuId';
  const values = {
    $title: title,
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

menusRouter.delete('/:menuId', (req, res, next) => {
  console.log('made it to menusRouter.delete/:menuId')
  const sql = 'UPDATE Menu SET id = 0 WHERE Menu.id = $menuId';
  const values = {$menuId: req.params.menuId};

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

module.exports = menusRouter;
