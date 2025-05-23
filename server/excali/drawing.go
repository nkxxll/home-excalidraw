package excali

import "fmt"

type Drawing struct {
	ID       int    `db:"id"`
	Created  string `db:"created"`
	Modified string `db:"modified"`
	Data     string `db:"data"`
}

func NewDrawing(id int, created, modified string, data string) Drawing {
	return Drawing{id, created, modified, data}
}

func (d Drawing) String() string {
	return fmt.Sprintf("Drawing{ID: %d, Created: %s, Modified: %s, Data: %q}", d.ID, d.Created, d.Modified, d.Data)
}
