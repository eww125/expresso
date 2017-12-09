const express = require('express');
const menu_itemsRouter = express.Router({mergeParams: true});

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

menu_itemsRouter.param('menu_itemId', (req, res, next, menu_itemId) => {
  console.log('made it to menu_itemsRouter.param menu_itemId')
  console.log('menu_itemId=' + menu_itemId)
  const sql = 'SELECT * FROM MenuItem WHERE MenuItem.id = $menu_itemId';
  const values = {$menu_itemId: menu_itemId};
  db.get(sql, values, (error, menu_item) => {
    if (error) {
      next(error);
    } else if (menu_item) {
      next();
    } else {
      res.sendStatus(404);
    }
  });
});

menu_itemsRouter.get('/', (req, res, next) => {
  console.log('made it to menu_itemsRouter.get/')
  console.log('req.params.menuId=' + req.params.menuId)
  const sql = 'SELECT * FROM MenuItem WHERE MenuItem.menu_id = $menuId';
  const values = { $menuId: req.params.menuId};
  db.all(sql, values, (error, menu_items) => {
    if (error) {
      next(error);
    } else {
      res.status(200).json({menu_items: menu_items});
    }
  });
});

menu_itemsRouter.post('/', (req, res, next) => {
  //console.log('made it to menu_itemsRouter.post/')
  const name = req.body.menu_item.name,
        description = req.body.menu_item.description,
        inventory = req.body.menu_item.inventory,
        price = req.body.menu_item.price,
        menuId = req.body.menu_item.menuId;
  const menuSql = 'SELECT * FROM Menu WHERE Menu.id = $menuId';
  const menuValues = {$menuId: menuId};
  db.get(menuSql, menuValues, (error, menu) => {
    if (error) {
      next(error);
    } else {
      if (!name || !description || !inventory || !price || !menu) {
        return res.sendStatus(400);
      }

      const sql = 'INSERT INTO MenuItem (name, description, inventory, price, menu_id)' +
          'VALUES ($name, $description, $inventory, $price, $menuId)';
      const values = {
        $name: name,
        $description: description,
        $inventory: inventory,
        $price: price,
        $menuItemId: req.params.menuItemId
      };

      db.run(sql, values, function(error) {
        if (error) {
          next(error);
        } else {
          db.get(`SELECT * FROM MenuItem WHERE MenuItem.id = ${this.lastID}`,
            (error, menu_item) => {
              res.status(201).json({menu_item: menu_item});
            });
        }
      });
    }
  });
});

menu_itemsRouter.put('/:menu_itemId', (req, res, next) => {
  //console.log('made it to menu_itemsRouter.put/:menu_itemId')
  const name = req.body.menu_item.name,
        description = req.body.menu_item.description,
        inventory = req.body.menu_item.inventory,
        price = req.body.menu_item.price,
        menuId = req.body.menu_item.menuId;
        const menuSql = 'SELECT * FROM Menu WHERE Menu.id = $menuId';
        const menuValues = {$menuId: menuId};
  db.get(menuSql, menuValues, (error, menu) => {
    if (error) {
      next(error);
    } else {
      if (!name || !description || !inventory || !price || !menu) {
        return res.sendStatus(400);
      }

      const sql = 'UPDATE MenuItem SET name = $name, description = $description, ' +
          'inventory = $inventory, price = $price ' +
          'WHERE MenuItem.id = $menu_itemId';
      const values = {
        $name: name,
        $description: description,
        $inventory: inventory,
        $price: price,
        $menuItemId: req.params.menuItemId
      };

      db.run(sql, values, function(error) {
        if (error) {
          next(error);
        } else {
          db.get(`SELECT * FROM MenuItem WHERE MenuItem.id = ${req.params.menu_itemId}`,
            (error, menu_item) => {
              res.status(200).json({menu_item: menu_item});
            });
        }
      });
    }
  });
});

menu_itemsRouter.delete('/:menu_itemId', (req, res, next) => {
  //console.log('made it to menu_itemsRouter.delete/:menu_itemId')
  const sql = 'DELETE FROM MenuItem WHERE MenuItem.id = $menu_itemId';
  const values = {$menu_itemId: req.params.menu_itemId};

  db.run(sql, values, (error) => {
    if (error) {
      next(error);
    } else {
      res.sendStatus(204);
    }
  });
});

module.exports = menu_itemsRouter;
