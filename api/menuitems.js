const express = require('express');
menuitemRouter = express.Router({mergeParams: true});
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

menuitemRouter.param('menuItemId', (req, res, next, menuItemId) => {
    db.get(`SELECT * FROM MenuItem WHERE MenuItem.id = ${menuItemId}`, 
    (error, menuItem) => {
        if(error){
            next(error);
        }
        else if(menuItem){
            req.menuItem = menuItem;
            next();
        }
        else{
            res.sendStatus(404);
        }
    });
});

menuitemRouter.get('/', (req, res, next) => {
    db.all(`SELECT * FROM MenuItem WHERE MenuItem.menu_id = ${req.params.menuId}`,
    (err, items) => {
        if(err){
            next(err);
        }
        else{
            res.status(200).json({menuItems: items});
        }
    });
});

menuitemRouter.post('/', (req, res, next) => {
    const name = req.body.menuItem.name;
    const description = req.body.menuItem.description;
    const inventory = req.body.menuItem.inventory;
    const price = req.body.menuItem.price;
    const menuId = req.params.menuId;

    if(!name || !inventory || !price){
        return res.sendStatus(400);
    }

    db.run(`INSERT INTO MenuItem (name, description, inventory, price, menu_id)
            VALUES ($name, $desc, $inv, $price, $menuId)`,
        {
            $name: name, 
            $desc: description, 
            $inv: inventory,
            $price: price, 
            $menuId: menuId
        },
        function(error){
            if(error){
                next(error);
            }
            else{
                db.get(`SELECT * FROM MenuItem WHERE MenuItem.id = ${this.lastID}`,
                (err, item) =>{
                    res.status(201).json({menuItem: item });
                })
            }
        });
});

menuitemRouter.put('/:menuItemId', (req, res, next) =>{
    const name = req.body.menuItem.name;
    const description = req.body.menuItem.description;
    const inventory = req.body.menuItem.inventory;
    const price = req.body.menuItem.price;

    if(!name || !inventory || !price){
        return res.sendStatus(400);
    }
    db.run(`UPDATE MenuItem SET name = $name, 
                                description = $desc, 
                                inventory = $inventory, 
                                price = $price
            WHERE MenuItem.id = $menuItemId`,
    {
        $name: name,
        $desc: description,
        $inventory: inventory,
        $price: price,
        $menuItemId: req.params.menuItemId
    }, 
    function(err){
        if(err){
            next(err);
        }
        else{
            db.get(`SELECT * FROM MenuItem WHERE MenuItem.id = ${req.params.menuItemId}`, 
            (error, item) => {
                res.status(200).json({menuItem: item});
            })
        }
    });
});

menuitemRouter.delete('/:menuItemId', (req, res, next) =>{
    db.run(`DELETE FROM MenuItem WHERE MenuItem.id = ${req.params.menuItemId}`, 
    (err, item) =>{
        if(err){
            next(err);
        }
        else{
            res.status(204).send();
        }
    });
});

module.exports = menuitemRouter;