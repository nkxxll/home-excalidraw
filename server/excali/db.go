package excali

import (
	"database/sql"
	"fmt"
	"log/slog"
	"os"

	_ "github.com/mattn/go-sqlite3"
)

type Database struct {
	db *sql.DB
}

func (db Database) DropDrawings() {
	sqlStmt := `delete from drawings`
	_, err := db.db.Exec(sqlStmt)
	if err != nil {
		panic("error removing stuff")
	}
}

func (db *Database) Close() {
	db.db.Close()
}

// SetupDB - returns the db handle for the application and sets up the database
// remember that you have to close the thing for best practice
func SetupDB() Database {
	db, err := sql.Open("sqlite3", "./test.db")
	if err != nil {
		slog.Error(fmt.Sprint("Error Initializing the db", err.Error()))
		os.Exit(1)
	}
	// TODO: setup the db
	sqlStmt := `
    CREATE TABLE IF NOT EXISTS drawings (
        id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
		created TEXT,
		modified TEXT,
        data TEXT
    );
    `
	_, err = db.Exec(sqlStmt)
	if err != nil {
		slog.Error(fmt.Sprint("Error Initializing the db", err.Error()))
		os.Exit(1)
	}
	return Database{db: db}
}

func errNilGetId(msg string, err error) {
	slog.Error(fmt.Sprint(msg, err))
}

func (db Database) GetDrawingById(id string) Drawing {
	var did int
	var created string
	var modified string
	var blob string
	sqlQuery := fmt.Sprintf(`SELECT * FROM drawings WHERE id == %s`, id)
	rows, err := db.db.Query(sqlQuery)
	if err != nil {
		errNilGetId("Error querying from database", err)
		return NewDrawing(-1, "", "", "")
	}
	if rows.Next() {
		err := rows.Scan(&did, &created, &modified, &blob)
		if err != nil {
		    errNilGetId("Error scanning the drawing", err)
		}
	}
	if rows.Next() {
		slog.Warn("There is one more element with this id this should not happen")
	}

	return NewDrawing(did, created, modified, blob)
}

func (db Database) SaveDrawing(d SaveDrawing) error {
	prep := `insert into drawings(created, modified, data) values(?, ?, ?)`
	tx, err := db.db.Begin()
	if err != nil {
		return fmt.Errorf("Error beginning transaction %v", err.Error())
	}
	stmt, err := tx.Prepare(prep)
	if err != nil {
		return fmt.Errorf("Error getting statement %v", err.Error())
	}
	defer stmt.Close()

	_, err = stmt.Exec(d.Created, d.Modified, d.Data)
	if err != nil {
		return fmt.Errorf("Error executing statement %v", err.Error())
	}

	err = tx.Commit()
	if err != nil {
		return fmt.Errorf("Error committing transaction %v", err.Error())
	}

	return nil
}

func getErrorReturn(msg string, err error) []Drawing {
	slog.Error(fmt.Sprint(msg, err.Error()))

	return []Drawing{}
}

func (db Database) GetAllDrawing() []Drawing {
	var drawings []Drawing
	query := `SELECT * FROM drawings;`
	rows, err := db.db.Query(query)
	if err != nil {
		return getErrorReturn("Querying db failed because of:", err)
	}

	defer rows.Close()

	for rows.Next() {
		var id int
		var created string
		var modified string
		var blob string
		err = rows.Scan(&id, &created, &modified, &blob)
		if err != nil {
			return getErrorReturn("Error scanning row", err)
		}
		d := NewDrawing(id, created, modified, blob)
		slog.Info(fmt.Sprintf("Get returned item: %s", d.String()))
		drawings = append(drawings, d)
	}
	err = rows.Err()
	if err != nil {
		return getErrorReturn("Error after row loop:", err)
	}

	return drawings
}
