package excali

import (
	"encoding/json"
	"log/slog"
	"net/http"
)

type handler = func(http.ResponseWriter, *http.Request)

type HttpError struct {
	Msg   string `json:"msg"`
	Error string `json:"error"`
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

func HandleSave(db Database) handler {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method == "POST" {
			var body []byte
			var drawing Drawing
			_, err := r.Body.Read(body)
			if err != nil {
				// FIXME: don't do that at home this is information disclosure
				writeError(w, "Error reading body", err)
				return
			}
			json.Unmarshal(body, &drawing)

			err = db.SaveDrawing(drawing)
			if err != nil {
				writeError(w, "Error saving drawing to db", err)
			    return 
			}

			w.WriteHeader(200)
		} else {
			http.Error(w, "Method not supported", 400)
		}
	}
}

func HandleLoad(db Database) handler {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method == "GET" {
			drawings := db.GetAllDrawing()
			jsonString, err := json.Marshal(drawings)
			if err != nil {
				slog.Error("Error Marshaling the drawings list")
				return
			}

			w.Header().Set("Content-Type", "application/json")
			w.Write(jsonString)
			w.WriteHeader(200)
		} else {
			http.Error(w, "Method not supported", 400)
		}
	}
}
