const express = require('express');
const issuesRouter = express.Router({mergeParams: true});

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

issuesRouter.param('issueId', (req, res, next, issueId) => {
  const sql = 'SELECT * FROM Issue WHERE Issue.id = $issueId';
  const values = {$issueId: issueId};
  db.get(sql, values, (error, issue) => {
    if (error) {
      next(error);
    } else if (issue) {
      next();
    } else {
      res.sendStatus(404);
    }
  });
});

issuesRouter.get('/', (req, res, next) => {
  const sql = 'SELECT * FROM Issue WHERE Issue.menu_id = $menuId';
  const values = { $menuId: req.params.menuId};
  db.all(sql, values, (error, issues) => {
    if (error) {
      next(error);
    } else {
      res.status(200).json({issues: issues});
    }
  });
});

issuesRouter.post('/', (req, res, next) => {
  const name = req.body.issue.name,
        issueNumber = req.body.issue.issueNumber,
        publicationDate = req.body.issue.publicationDate,
        employeeId = req.body.issue.employeeId;
  const artistSql = 'SELECT * FROM Employee WHERE Employee.id = $EmployeeId';
  const employeeValues = {$employeeId: employeeId};
  db.get(employeeSql, employeeValues, (error, employee) => {
    if (error) {
      next(error);
    } else {
      if (!name || !issueNumber || !publicationDate || !artist) {
        return res.sendStatus(400);
      }

      const sql = 'INSERT INTO Issue (name, issue_number, publication_date, employee_id, menu_id)' +
          'VALUES ($name, $issueNumber, $publicationDate, $employeeId, $menuId)';
      const values = {
        $name: name,
        $issueNumber: issueNumber,
        $publicationDate: publicationDate,
        $employeeId: employeeId,
        $menuId: req.params.menuId
      };

      db.run(sql, values, function(error) {
        if (error) {
          next(error);
        } else {
          db.get(`SELECT * FROM Issue WHERE Issue.id = ${this.lastID}`,
            (error, issue) => {
              res.status(201).json({issue: issue});
            });
        }
      });
    }
  });
});

issuesRouter.put('/:issueId', (req, res, next) => {
  const name = req.body.issue.name,
        issueNumber = req.body.issue.issueNumber,
        publicationDate = req.body.issue.publicationDate,
        artistId = req.body.issue.artistId;
  const employeeSql = 'SELECT * FROM Employee WHERE Employee.id = $employeeId';
  const employeeValues = {$employeeId: employeeId};
  db.get(employeeSql, employeeValues, (error, employee) => {
    if (error) {
      next(error);
    } else {
      if (!name || !issueNumber || !publicationDate || !employee) {
        return res.sendStatus(400);
      }

      const sql = 'UPDATE Issue SET name = $name, issue_number = $issueNumber, ' +
          'publication_date = $publicationDate, employee_id = $employeeId ' +
          'WHERE Issue.id = $issueId';
      const values = {
        $name: name,
        $issueNumber: issueNumber,
        $publicationDate: publicationDate,
        $employeeId: employeeId,
        $issueId: req.params.issueId
      };

      db.run(sql, values, function(error) {
        if (error) {
          next(error);
        } else {
          db.get(`SELECT * FROM Issue WHERE Issue.id = ${req.params.issueId}`,
            (error, issue) => {
              res.status(200).json({issue: issue});
            });
        }
      });
    }
  });
});

issuesRouter.delete('/:issueId', (req, res, next) => {
  const sql = 'DELETE FROM Issue WHERE Issue.id = $issueId';
  const values = {$issueId: req.params.issueId};

  db.run(sql, values, (error) => {
    if (error) {
      next(error);
    } else {
      res.sendStatus(204);
    }
  });
});

module.exports = issuesRouter;
