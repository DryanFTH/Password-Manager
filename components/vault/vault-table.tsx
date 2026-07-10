'use client';

import { useMemo } from 'react';
import {
    getCoreRowModel,
    useReactTable,
    flexRender,
    type RowSelectionState,
} from '@tanstack/react-table';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { buildColumns } from '@/components/vault/columns';
import type { DecryptedCategory, DecryptedPasswordItem } from '@/types/vault';

interface VaultTableProps {
    items: DecryptedPasswordItem[];
    categories: DecryptedCategory[];
    isLoading: boolean;
    showTrash: boolean;
    rowSelection: RowSelectionState;
    onRowSelectionChange: (state: RowSelectionState) => void;
    onEdit: (item: DecryptedPasswordItem) => void;
}

export function VaultTable({
    items,
    categories,
    isLoading,
    showTrash,
    rowSelection,
    onRowSelectionChange,
    onEdit,
}: VaultTableProps) {
    const columns = useMemo(
        () => buildColumns({ categories, showTrash, onEdit }),
        [categories, showTrash, onEdit],
    );

    const table = useReactTable({
        data: items,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getRowId: row => row.id,
        state: { rowSelection },
        onRowSelectionChange: updater => {
            const next = typeof updater === 'function' ? updater(rowSelection) : updater;
            onRowSelectionChange(next);
        },
        enableRowSelection: true,
    });

    return (
        <div className="overflow-hidden overflow-x-auto border-2 border-border">
            <Table>
                <TableHeader>
                    {table.getHeaderGroups().map(headerGroup => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map(header => (
                                <TableHead key={header.id}>
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
                    {isLoading ? (
                        <TableRow>
                            <TableCell
                                colSpan={columns.length}
                                className="py-8 text-center text-sm text-muted-foreground"
                            >
                                Mendekripsi vault...
                            </TableCell>
                        </TableRow>
                    ) : (
                        table.getRowModel().rows.map(row => (
                            <TableRow
                                key={row.id}
                                data-state={row.getIsSelected() ? 'selected' : undefined}
                            >
                                {row.getVisibleCells().map(cell => (
                                    <TableCell key={cell.id}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
