package excali

import (
	"encoding/json"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
)

type HttpError struct {
	Msg   string `json:"msg"`
	Error string `json:"error"`
}

func HandleUpdate(db Database) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var body []byte
		var drawing Drawing

		body, err := io.ReadAll(r.Body)
		if err != nil {
			writeError(w, "Error Unmarshal:", err)
		}
		json.Unmarshal(body, &drawing)

		err = db.UpdateDrawing(drawing)
		if err != nil {
			writeError(w, "Error updating the database", err)
		}
		w.WriteHeader(200)
	}
}

func NewHttpError(msg string, err error) HttpError {
	return HttpError{Msg: msg, Error: err.Error()}
}

func writeError(w http.ResponseWriter, msg string, err error) {
	js, err := json.Marshal(NewHttpError(msg, err))
	if err != nil {
		panic("this should never happen")
	}

	w.Write(js)
	w.WriteHeader(500)
}

func HandleSave(db Database) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method == "POST" {
			var body []byte
			var drawing SaveDrawing
			defer r.Body.Close()
			body, err := io.ReadAll(r.Body)
			if err != nil {
				// FIXME: don't do that at home this is information disclosure
				writeError(w, "Error reading body", err)
				return
			}
			// this could be bad because of the id or we use uuid
			json.Unmarshal(body, &drawing)

			id, err := db.SaveDrawing(drawing)
			slog.Info(fmt.Sprint("Saved drawing: ", drawing.String()))
			if err != nil {
				writeError(w, "Error saving drawing to db", err)
				return
			}

			w.Write([]byte(strconv.Itoa(id)))
		} else {
			http.Error(w, "Method not supported", 400)
		}
	}
}

func getAll(w http.ResponseWriter, db Database) {
	drawings := db.GetAllDrawing()
	jsonString, err := json.Marshal(drawings)
	slog.Info(fmt.Sprintf("JSON String %s", string(jsonString)))
	if err != nil {
		slog.Error("Error Marshaling the drawings list")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(jsonString)
}

func HandleGetById(db Database) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method == "GET" {
		} else {
			http.Error(w, "Method not supported", 400)
		}
	}
}

func HandleLoad(db Database) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method == "GET" {
			getAll(w, db)
		} else {
			http.Error(w, "Method not supported", 400)
		}
	}
}

func HandleDelete(db Database) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		vars := mux.Vars(r)
		id := vars["id"]

		intId, err := strconv.Atoi(id)
		if err != nil {
			writeError(w, "Error id is not a number", err)
			return
		}
		err = db.DeleteDrawing(intId)
		if err != nil {
			writeError(w, "Error deleting drawing", err)
			return
		}
		slog.Info(fmt.Sprintf("deleted item %d", intId))

		w.WriteHeader(204)
	}
}
