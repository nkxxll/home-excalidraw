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
					return <li key={`${item.id}`}>{`${item.id} ${item.created} ${item.modified} ${item.data}`}</li>;
				})}
			</ul>
		</div>
	);
}
