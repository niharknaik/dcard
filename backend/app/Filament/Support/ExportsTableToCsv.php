<?php

namespace App\Filament\Support;

use Filament\Actions\Action;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Adds a "Export CSV" header action to a Filament ListRecords page that streams
 * the currently-filtered query through a column => callback map.
 */
trait ExportsTableToCsv
{
    /**
     * @param  array<string, callable>  $columns  Header => fn($record): scalar
     */
    protected function csvExportAction(string $filename, array $columns): Action
    {
        return Action::make('exportCsv')
            ->label('Export CSV')
            ->icon('heroicon-o-arrow-down-tray')
            ->color('gray')
            ->action(function () use ($filename, $columns): StreamedResponse {
                $query = $this->getFilteredTableQuery();
                $name = $filename.'-'.now()->format('Y-m-d-His').'.csv';

                return response()->streamDownload(function () use ($query, $columns) {
                    $handle = fopen('php://output', 'w');
                    fputcsv($handle, array_keys($columns));

                    $query->chunk(500, function ($records) use ($handle, $columns) {
                        foreach ($records as $record) {
                            fputcsv($handle, array_map(fn ($cb) => $cb($record), array_values($columns)));
                        }
                    });

                    fclose($handle);
                }, $name, ['Content-Type' => 'text/csv']);
            });
    }
}
