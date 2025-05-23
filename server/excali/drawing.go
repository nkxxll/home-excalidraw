package excali

import "fmt"

type Drawing struct {
	ID       int    `db:"id"`
	Created  string `db:"created"`
	Modified string `db:"modified"`
	Data     string `db:"data"`
}

// SaveDrawing this is a helper struct that only misses the id because the id
// is auto generated for saving drawings
type SaveDrawing struct {
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


func (d SaveDrawing) String() string {
	return fmt.Sprintf("Drawing{Created: %s, Modified: %s, Data: %q}", d.Created, d.Modified, d.Data)
}
