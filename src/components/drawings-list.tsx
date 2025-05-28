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
import {
	Table,
	TableHeader,
	TableBody,
	TableRow,
	TableHead,
	TableCell,
} from "./ui/table";

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
			<div className="border rounded-2xl fixed top-10 right-10 bg-gray-200 left-10 bottom-10 overflow-scroll w-1/2 z-10 p-4">
				<div className="flex">
					<Input
						placeholder="Search..."
						onChange={(e) => setSearch(e.target.value)}
					/>
					<Button onClick={onClose}>Close</Button>
				</div>
				<div className="py-4">
					<Table className="border-gray-200 overflow-hidden">
						<TableHeader className="bg-gray-100">
							{table.getHeaderGroups().map((headerGroup) => (
								<TableRow key={headerGroup.id}>
									{headerGroup.headers.map((header) => (
										<TableHead
											key={header.id}
											className="p-3 text-gray-600 font-semibold whitespace-normal break-words"
										>
											{header.isPlaceholder
												? null
												: flexRender(
														header.column.columnDef.header,
														header.getContext(),
													)}
										</TableHead>
									))}
								</TableRow>
							))}
						</TableHeader>

						<TableBody>
							{table.getRowModel().rows.length ? (
								table.getRowModel().rows.map((row) => (
									<TableRow
										key={row.id}
										className="transition hover:bg-muted/50 cursor-pointer"
									>
										{row.getVisibleCells().map((cell) => (
											<TableCell
												key={cell.id}
												className="p-3 whitespace-normal break-words"
											>
												{flexRender(
													cell.column.columnDef.cell,
													cell.getContext(),
												)}
											</TableCell>
										))}
									</TableRow>
								))
							) : (
								<TableRow>
									<TableCell
										colSpan={table.getAllColumns().length}
										className="text-center p-3 whitespace-normal break-words"
									>
										No results.
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</div>
			</div>
		</>
	);
}
