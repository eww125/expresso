const express = require('express');
const apiRouter = express.Router();
const employeesRouter = require('./employees.js');
const menu_itemsRouter = require('./menu_items.js');
const menusRouter = require('./menus.js');
const timesheetsRouter = require('./timeheets.js');

apiRouter.use('/employees', employeesRouter);
apiRouter.use('/menu_items', menu_itemsRouter);
apiRouter.use('/menus', menusRouter);
apiRouter.use('/timesheets', timesheetsRouter);

module.exports = apiRouter;
