const express =  require('express');
const sqlite3 = require('sqlite3');
const menuRouter = express.Router();
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const menuItemRouter = require('./menuitems.js');

menuRouter.param('menuId', (req, res, next, menuId) =>{
    db.get(`SELECT * FROM Menu WHERE Menu.id = ${menuId}`, (err, menu) => {
        if(err){
            next(err);
        }
        else if(menu){
            req.menu = menu;
            next();
        }
        else{
            res.sendStatus(404);
        }
    });
});

menuRouter.get('/', (req, res, next) => {
    db.all("SELECT * FROM Menu", 
    (err, menus) => {
        if(err){
            next(err);
        }
        else{
            res.status(200).json({ menus: menus});
        }
    })
});

menuRouter.post('/', (req, res, next) => {
    const title = req.body.menu.title;
    if(!title){
      return res.sendStatus(400);
    }
    db.run(`INSERT INTO Menu (title) VALUES ($title)`, 
    {$title: title},
    function(err){
        if(err){
            next(err);
        }
        else{
            db.get(`SELECT * FROM Menu WHERE Menu.id = ${this.lastID}`, (error, menu) => {
                res.status(201).json({ menu: menu });
            });
        }
    });
});

menuRouter.get('/:menuId', (req, res, next) => {
    res.status(200).json({menu: req.menu});
});

menuRouter.put('/:menuId', (req, res, next) => {
    const title = req.body.menu.title;
    if(!title){
      return res.sendStatus(400);
    }
    db.run(`UPDATE Menu SET title = $title WHERE Menu.id = $menuId`, { $title: title, $menuId: req.params.menuId},
    function(err){
        if(err){
            next(err);
        }
        else{
            db.get(`SELECT * FROM Menu WHERE Menu.id = ${req.params.menuId}`, (error, menu) =>{
                res.status(200).json({menu: menu});
            })
        }
    });
});

menuRouter.delete('/:menuId', (req, res, next) => {
    db.get(`SELECT * FROM MenuItem WHERE MenuItem.menu_id = ${req.params.menuId}`, 
    (error, item) => {
        if (error){
            next(error);
        }
        else if (item){
            res.sendStatus(400);
        }
        else{
            db.run(`DELETE FROM Menu WHERE Menu.id = ${req.params.menuId}`, 
            (error) => {
                if(error){
                    next(error);
                }
                else{
                    res.sendStatus(204);
                }
            });
        }
    });
});
// Menu Items Router
menuRouter.use('/:menuId/menu-items', menuItemRouter);

module.exports = menuRouter;