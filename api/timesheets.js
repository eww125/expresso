const express = require('express');
const timeSheetRouter = express.Router({mergeParams: true});
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

timeSheetRouter.param('timesheetId', (req, res, next, timesheetId) =>{
    db.get(`SELECT * FROM Timesheet WHERE Timesheet.id = ${timesheetId}`, (err, timesheet) => {
        if(err){
            next(err);
        }
        else if(timesheet){
            req.timesheet = timesheet;
            next();
        }
        else{
            res.sendStatus(404);
        }
    });
});

timeSheetRouter.get('/', (req, res, next) => {
    db.all(`SELECT * FROM Timesheet WHERE employee_id = ${req.params.employeeId}`,
    (error, rows) => {
        if(error){
            next(error);
        }
        else{
            res.status(200).json({ timesheets: rows });
        }
    });
});

timeSheetRouter.post('/', (req, res, next) => {
    const hours = Number(req.body.timesheet.hours);
    const rate = Number(req.body.timesheet.rate);
    const date = Number(req.body.timesheet.date);

    if(!hours || !rate || !date){
        return res.sendStatus(400);
    }
    db.run(`INSERT INTO Timesheet (hours, rate, date, employee_id) 
            VALUES ( $hours, $rate, $date, $empId)`,
        { $hours: hours,
            $rate: rate,
            $date: date,
            $empId: req.params.employeeId },
        function(err){
            if(err){
                next(err);
            }
            else {
                db.get(`SELECT * FROM Timesheet WHERE id = ${this.lastID}`,
                (err, timesheet) => {
                    res.status(201).json({timesheet: timesheet});
                });
            }
    });
});

timeSheetRouter.put('/:timesheetId', (req, res, next) => {
    const hours = req.body.timesheet.hours;
    const rate = req.body.timesheet.rate;
    const date = req.body.timesheet.date;

    if(!hours || !rate || !date){
       return res.sendStatus(400);
    }
    db.run(`UPDATE Timesheet SET hours = $hours,
                                 rate = $rate,
                                 date = $date
            WHERE Timesheet.id = $sheetId`,
        {
            $hours: hours,
            $rate: rate,
            $date: date,
            $sheetId: req.params.timesheetId
        },
    (error) => {
        if(error){
            console.log(error);
            next(error);
        }
        else{
            db.get(`SELECT * FROM Timesheet WHERE Timesheet.id = ${ req.params.timesheetId}`,
            (error, sheet) =>{
                res.status(200).json({ timesheet: sheet});
            });
        }
    });
});

timeSheetRouter.delete('/:timesheetId', (req, res, next) => {
    db.run(`DELETE FROM Timesheet WHERE Timesheet.id = ${ req.params.timesheetId }`, 
    (err) =>{
        res.sendStatus(204);
    });
});

module.exports = timeSheetRouter;