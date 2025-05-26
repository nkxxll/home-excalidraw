package excali

import "fmt"

type Drawing struct {
	ID       int    `db:"id" json:"id"`
	Title    string `db:"title" json:"title"`
	Created  string `db:"created" json:"created"`
	Modified string `db:"modified" json:"modified"`
	Data     string `db:"data" json:"data"`
}

// SaveDrawing this is a helper struct that only misses the id because the id
// is auto generated for saving drawings
type SaveDrawing struct {
	Title    string `db:"title" json:"title"`
	Created  string `db:"created" json:"created"`
	Modified string `db:"modified" json:"modified"`
	Data     string `db:"data" json:"data"`
}

func NewDrawing(id int, title, created, modified string, data string) Drawing {
	return Drawing{id, title, created, modified, data}
}

func (d Drawing) String() string {
	return fmt.Sprintf("Drawing{ID: %d, Created: %s, Modified: %s, Data: %q}", d.ID, d.Created, d.Modified, d.Data)
}

func (d SaveDrawing) String() string {
	return fmt.Sprintf("Drawing{Created: %s, Modified: %s, Data: %q}", d.Created, d.Modified, d.Data)
}
