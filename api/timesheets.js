console.log('made it to timesheets.js')

const express = require('express');
const timesheetsRouter = express.Router({mergeParams: true});

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

timesheetsRouter.param('timesheetId', (req, res, next, timesheetId) => {
  console.log('made it to timesheetsRouter.param timesheetId')
  const sql = 'SELECT * FROM Timesheet WHERE Timesheet.id = $timesheetId';
  const values = {$timesheetId: timesheetId};
  db.get(sql, values, (error, timesheet) => {
    if (error) {
      next(error);
    } else if (timesheet) {
      next();
    } else {
      res.sendStatus(404);
    }
  });
});

timesheetsRouter.get('/', (req, res, next) => {
  console.log('made it to timesheetsRouter.get/')
  const sql = 'SELECT * FROM Timesheet WHERE Timesheet.menu_id = $menuId';
  const values = { $menuId: req.params.menuId};
  db.all(sql, values, (error, timesheets) => {
    if (error) {
      next(error);
    } else {
      res.status(200).json({timesheets: timesheets});
    }
  });
});

timesheetsRouter.post('/', (req, res, next) => {
  console.log('made it to timesheetsRouter.post/')
  const name = req.body.timesheet.name,
        timesheetNumber = req.body.timesheet.timesheetNumber,
        publicationDate = req.body.timesheet.publicationDate,
        employeeId = req.body.timesheet.employeeId;
  const artistSql = 'SELECT * FROM Employee WHERE Employee.id = $EmployeeId';
  const employeeValues = {$employeeId: employeeId};
  db.get(employeeSql, employeeValues, (error, employee) => {
    if (error) {
      next(error);
    } else {
      if (!name || !timesheetNumber || !publicationDate || !artist) {
        return res.sendStatus(400);
      }

      const sql = 'INSERT INTO Timesheet (name, timesheet_number, publication_date, employee_id, menu_id)' +
          'VALUES ($name, $timesheetNumber, $publicationDate, $employeeId, $menuId)';
      const values = {
        $name: name,
        $timesheetNumber: timesheetNumber,
        $publicationDate: publicationDate,
        $employeeId: employeeId,
        $menuId: req.params.menuId
      };

      db.run(sql, values, function(error) {
        if (error) {
          next(error);
        } else {
          db.get(`SELECT * FROM Timesheet WHERE Timesheet.id = ${this.lastID}`,
            (error, timesheet) => {
              res.status(201).json({timesheet: timesheet});
            });
        }
      });
    }
  });
});

timesheetsRouter.put('/:timesheetId', (req, res, next) => {
  console.log('made it to timesheetsRouter.put/:timesheetId')
  const name = req.body.timesheet.name,
        timesheetNumber = req.body.timesheet.timesheetNumber,
        publicationDate = req.body.timesheet.publicationDate,
        artistId = req.body.timesheet.artistId;
  const employeeSql = 'SELECT * FROM Employee WHERE Employee.id = $employeeId';
  const employeeValues = {$employeeId: employeeId};
  db.get(employeeSql, employeeValues, (error, employee) => {
    if (error) {
      next(error);
    } else {
      if (!name || !timesheetNumber || !publicationDate || !employee) {
        return res.sendStatus(400);
      }

      const sql = 'UPDATE Timesheet SET name = $name, timesheet_number = $timesheetNumber, ' +
          'publication_date = $publicationDate, employee_id = $employeeId ' +
          'WHERE Timesheet.id = $timesheetId';
      const values = {
        $name: name,
        $timesheetNumber: timesheetNumber,
        $publicationDate: publicationDate,
        $employeeId: employeeId,
        $timesheetId: req.params.timesheetId
      };

      db.run(sql, values, function(error) {
        if (error) {
          next(error);
        } else {
          db.get(`SELECT * FROM Timesheet WHERE Timesheet.id = ${req.params.timesheetId}`,
            (error, timesheet) => {
              res.status(200).json({timesheet: timesheet});
            });
        }
      });
    }
  });
});

timesheetsRouter.delete('/:timesheetId', (req, res, next) => {
  console.log('made it to timesheetsRouter.delete/:timesheetId')
  const sql = 'DELETE FROM Timesheet WHERE Timesheet.id = $timesheetId';
  const values = {$timesheetId: req.params.timesheetId};

  db.run(sql, values, (error) => {
    if (error) {
      next(error);
    } else {
      res.sendStatus(204);
    }
  });
});

module.exports = timesheetsRouter;
