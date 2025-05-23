package main

import (
	"fmt"
	"net/http"
	"homeexcalidrawserver/excali"
)

func main() {

	db := excali.SetupDB()
	defer db.Close()

	http.HandleFunc("/save", excali.HandleSave(db))
	http.HandleFunc("/load", excali.HandleLoad(db))

	err := http.ListenAndServe(":42069", nil)
	if err != nil {
		fmt.Println("Error occurred running the server", err)
		return;
	}
}
