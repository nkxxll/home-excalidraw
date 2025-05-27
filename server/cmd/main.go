package main

import (
	"fmt"
	"github.com/gorilla/mux"
	"homeexcalidrawserver/excali"
	"net/http"
)

func main() {

	db := excali.SetupDB("local.db")
	defer db.Close()

	r := mux.NewRouter()

	r.HandleFunc("/save", excali.HandleSave(db)).Methods("POST")
	r.HandleFunc("/load", excali.HandleLoad(db)).Methods("GET")
	r.HandleFunc("/update", excali.HandleUpdate(db)).Methods("PUT")
	r.HandleFunc("/delete/{id}", excali.HandleDelete(db)).Methods("DELETE")

	err := http.ListenAndServe(":42069", r)
	if err != nil {
		fmt.Println("Error occurred running the server", err)
		return
	}
}
