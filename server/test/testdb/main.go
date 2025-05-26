package main

import (
	"flag"
	"fmt"
	"homeexcalidrawserver/excali"
	"os"
	"slices"
)

func main() {
	keep := flag.Bool("keep", false, "keep the db entries")
	flag.Parse()
	fmt.Println("Keep:", *keep)
	db := excali.SetupDB("test.db")
	defer db.Close()

	res := db.GetAllDrawing()
	if !slices.Equal(res, []excali.Drawing{}) {
		fmt.Println("there is somethign wrong there is some data there that shouldnt")
		os.Exit(1)
	}

	drawings := []excali.SaveDrawing{
		{
			Title:  "some title",
			Created:  "2025-05-23T10:00:00Z",
			Modified: "2025-05-23T10:00:00Z",
			Data:     "", // No blob data
		},
		{
			Title:  "some title",
			Created:  "2025-05-23T11:00:00Z",
			Modified: "2025-05-23T11:30:00Z",
			Data:     "{name: some, other; json}",
		},
		{
			Title:  "some title",
			Created:  "2025-05-23T12:00:00Z",
			Modified: "2025-05-23T12:15:00Z",
			Data:     "",
		},
	}

	for _, d := range drawings {
		err := db.SaveDrawing(d)
		if err != nil {
			fmt.Println("this is bad here is the error", err)
			os.Exit(1)
		}
	}

	drws := db.GetAllDrawing()

	if len(drws) != 3 {
		fmt.Println("three item not equals three items")
		if !*keep {
			db.DropDrawings()
		}
		os.Exit(1)
	}

	for _, d := range drws {
		fmt.Println("found drawing after saving", d.String())
	}

	if !*keep {
		db.DropDrawings()
	}
}
