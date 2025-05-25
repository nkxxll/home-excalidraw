interface DrawingsListParms {
	items: any[];
	onClose: () => void;
	onSubmit: (item) => void;
}

export default function DrawingsList({
	items,
	onClose,
	onSubmit,
}: DrawingsListParms) {
	return (
		<div className="fixed top-0 right-0 left-0 w-1/2 z-10">
			<ul>
				{items.map((item, idx) => {
					return <li key={`${item.ID}`}>{`${item.ID} ${item.Created} ${item.Modified} ${item.Data}`}</li>;
				})}
			</ul>
		</div>
	);
}
