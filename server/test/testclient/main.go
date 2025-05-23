package main

import (
	"bytes"
	"encoding/json"
	"flag"
	"fmt"
	"homeexcalidrawserver/excali"
	"io"
	"net/http"
	"os"
)

func errExit(msg string) {
	fmt.Println("Error:", msg)
	os.Exit(1)
}

func main() {
	save := flag.Bool("save", false, "whether to save or to load")
	flag.Parse()
	if *save {
		url := "http://localhost:42069/save"
		d := excali.NewDrawing(1, "2025-05-23 21:11", "2025-05-23 21:11", "{\"some\": \"json\"}")
		body, err := json.Marshal(d)
		if err != nil {
			errExit("marshaling should not happen")
		}
		res, err := http.Post(url, "application/json", bytes.NewReader(body))
		if err != nil {
			errExit("error posting")
		}
		if res.Status != "200 OK" {
			fmt.Println("status", res.Status)
			errExit("status not 200")
		}
	} else {
		url := "http://localhost:42069/load"
		res, err := http.Get(url)
		if err != nil {
			errExit("request failed")
		}

		if res.Status != "200 OK" {
			errExit(fmt.Sprintf("%s status not 200", res.Status))
		}

		var body []byte
		body, err = io.ReadAll(res.Body)
		defer res.Body.Close()
		if err != nil {
			errExit("reading res body")
		}

		var drawings []excali.Drawing

		err = json.Unmarshal(body, &drawings)

		for _, d := range drawings {
			fmt.Println(d.String())
		}
	}
}
