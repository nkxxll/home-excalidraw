interface DrawingsListParms {
  items: any[],
  onClose: () => void,
  onSubmit: (item) => void 
}

export default function DrawingsList({items, onClose, onSubmit}: DrawingsListParms) {
  return (
    <ul>
    {items.map((item, idx) => {
      return <li key={`${item}-${idx}`}>{item}</li>
    })}
    </ul>
  )
}

