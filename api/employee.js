const express = require('express');
const employeeRouter = express.Router();
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');
const timeSheetRouter = require('./timesheets.js');

employeeRouter.param('employeeId', (req, res, next, employeeId) => {
    db.get(`SELECT * FROM Employee WHERE Employee.id = ${employeeId}`, (err, employee) => {
        if(employee){
            req.employee = employee;
            next();
        }
        else{
            res.sendStatus(404);
        }
    });
});

employeeRouter.get('/', (req, res, next) => {
    db.all("SELECT * FROM Employee WHERE Employee.is_current_employee = 1", 
    (error, employees) => {
        if(error){
            next(error);
        }
        else{
            res.status(200).json({ employees: employees });
        }
    });
});

employeeRouter.post('/', (req, res, next) => {    
    const isEmployee = req.body.employee.isCurrentEmployee === 0 ? 0 : 1;
    const empName = req.body.employee.name;
    const position = req.body.employee.position;
    const wage = req.body.employee.wage;
    
    if(!empName || !position || !wage){
        return res.sendStatus(400);
    }
    db.run(`INSERT INTO Employee (name, position, wage, is_current_employee) 
        VALUES( $name, $position, $wage, $isEmployee)`,
            {   $name: empName,
                $position: position,
                $wage: wage,
                $isEmployee : isEmployee}, 
            function(err){
            if(err){
                next(err);
            }
            else{
                db.get(`SELECT * FROM Employee WHERE id = ${this.lastID}`, (error, employee) =>{
                    res.status(201).json({ employee: employee });
                });
            }
        });
});

employeeRouter.get('/:employeeId', (req, res, next) => {
    res.status(200).json({ employee: req.employee});
});

employeeRouter.put('/:employeeId', (req, res, send) => {
    const empName = req.body.employee.name;
    const position = req.body.employee.position;
    const wage = req.body.employee.wage;
    const isEmployee = req.body.employee.isCurrentEmployee === 0 ? 0 : 1;
    if(!empName || !position || !wage ){
        return res.sendStatus(400);
    }
    db.run(`UPDATE Employee SET name = $empName, 
                                position = $position, 
                                wage = $wage, 
                                is_current_employee = $isEmp 
            WHERE id = $empId`,
    {
        $empName: empName,
        $position: position,
        $wage: wage,
        $isEmp: isEmployee,
        $empId: req.params.employeeId
    },
    function(error){
        if(error){
            next(error);
        }
        else{
            db.get(`SELECT * FROM Employee WHERE id = ${req.params.employeeId}`, 
        (err, emp) => {
            res.status(200).json({ employee: emp});
        });
        }
    });
});

employeeRouter.delete('/:employeeId', (req, res, next) =>{
    db.run(`UPDATE Employee SET is_current_employee = 0 WHERE id = ${req.params.employeeId}`,
     (error) =>{
        if(error){
            next(error);
        }
        else{
            db.get(`SELECT * FROM Employee WHERE id = ${req.params.employeeId}`,
        (err, emp) => {
            res.status(200).json({ employee: emp});
        });
        }
    });
});

employeeRouter.use('/:employeeId/timesheets', timeSheetRouter);

module.exports = employeeRouter;