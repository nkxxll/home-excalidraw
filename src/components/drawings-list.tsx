import {
	createColumnHelper,
	flexRender,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useMemo, useState } from "react";
import type { Drawing } from "@/lib/types";

interface DrawingsListParms {
	items: Drawing[];
	onClose: () => void;
	onSubmit: (id: number, item: string) => Promise<void>;
	onDelete: (id: number) => void;
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
	onDelete,
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
				<>
					<div className="flex">
						<Button
							onClick={() => onSubmit(row.original.id, row.original.data)}
						>
							Load
						</Button>
						<Button onClick={() => onDelete(row.original.id)}>Delete</Button>
					</div>
				</>
			),
		}),
	];

	const [search, setSearch] = useState("");
	const filtered = useMemo(() => {
		if (search === "") {
			return items;
		}
		return items.filter((item) => item.title.includes(search));
	}, [search, items]);
	const table = useReactTable({
		data: filtered,
		columns,
		getCoreRowModel: getCoreRowModel(),
	});
	return (
		<>
			<div className="border rounded fixed top-10 right-10 bg-gray-200 left-10 bottom-10 overflow-scroll w-1/2 z-10">
				<div className="flex">
					<Input
						placeholder="Search..."
						onChange={(e) => setSearch(e.target.value)}
					/>
					<Button onClick={onClose}>Close</Button>
				</div>
				<div className="border rounded border-gray-200 p-4">
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
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext(),
											)}
										</td>
									))}
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</>
	);
}
