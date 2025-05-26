import {
	createColumnHelper,
	flexRender,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { Button } from "./ui/button";
import type { Drawing } from "@/lib/types";

interface DrawingsListParms {
	items: any[];
	onClose: () => void;
	onSubmit: (id: number, item: string) => Promise<void>;
}

interface DrawingsItem {
	id: number;
	title: string;
	created: string;
	modified: string;
	data: string; // json string
}

export default function DrawingsList({
	items,
	onClose,
	onSubmit,
}: DrawingsListParms) {
	const columnHelper = createColumnHelper<DrawingsItem>();

	const columns = [
		columnHelper.accessor("id", {
			header: "ID",
			cell: (info) => info.getValue(),
		}),
		columnHelper.accessor("title", {
			header: "Title",
			cell: (info) => info.getValue(),
		}),
		columnHelper.accessor("created", {
			header: "Created",
			cell: (info) => info.getValue(),
		}),
		columnHelper.accessor("modified", {
			header: "Modified",
			cell: (info) => info.getValue(),
		}),
		columnHelper.display({
			id: "actions",
			header: "Actions",
			cell: ({ row }) => (
				<Button onClick={() => onSubmit(row.original.id, row.original.data)}>Load</Button>
			),
		}),
	];

	const table = useReactTable({
    data: items,
		columns,
		getCoreRowModel: getCoreRowModel(),
	});
	return (
		<div className="fixed top-0 right-0 bg-gray-200 left-0 w-1/2 z-10">
			<div className="rounded border border-gray-200 p-4">
				<table className="w-full text-left">
					<thead className="bg-gray-400">
						{table.getHeaderGroups().map((headerGroup) => (
							<tr key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<th key={header.id} className="p-2 font-medium">
										{flexRender(
											header.column.columnDef.header,
											header.getContext(),
										)}
									</th>
								))}
							</tr>
						))}
					</thead>

					<tbody>
						{table.getRowModel().rows.map((row) => (
							<tr key={row.id} className="border-t hover:bg-gray-50">
								{row.getVisibleCells().map((cell) => (
									<td key={cell.id} className="p-2">
										{flexRender(cell.column.columnDef.cell, cell.getContext())}
									</td>
								))}
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
