<?php

namespace App\Traits;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Http\Resources\Json\ResourceCollection;
use Illuminate\Pagination\AbstractPaginator;

/**
 * Standard API response envelope used by every controller.
 */
trait ApiResponse
{
    protected function success(mixed $data = null, string $message = 'OK', int $status = 200, array $meta = []): JsonResponse
    {
        $payload = ['success' => true, 'message' => $message];

        // Unwrap paginators into data + meta.
        if ($data instanceof ResourceCollection && $data->resource instanceof AbstractPaginator) {
            return $data->additional(['success' => true, 'message' => $message])
                ->response()
                ->setStatusCode($status);
        }

        if ($data instanceof AbstractPaginator) {
            $payload['data'] = $data->items();
            $payload['meta'] = $this->paginationMeta($data);
        } else {
            $payload['data'] = $data instanceof JsonResource ? $data->resolve() : $data;
            if ($meta) {
                $payload['meta'] = $meta;
            }
        }

        return response()->json($payload, $status);
    }

    protected function created(mixed $data = null, string $message = 'Created.'): JsonResponse
    {
        return $this->success($data, $message, 201);
    }

    protected function noContent(string $message = 'Done.'): JsonResponse
    {
        return response()->json(['success' => true, 'message' => $message], 200);
    }

    protected function error(string $message = 'Something went wrong.', int $status = 400, array $errors = []): JsonResponse
    {
        $payload = ['success' => false, 'message' => $message];
        if ($errors) {
            $payload['errors'] = $errors;
        }

        return response()->json($payload, $status);
    }

    protected function paginationMeta(AbstractPaginator $paginator): array
    {
        return [
            'current_page' => $paginator->currentPage(),
            'per_page' => $paginator->perPage(),
            'total' => method_exists($paginator, 'total') ? $paginator->total() : null,
            'last_page' => method_exists($paginator, 'lastPage') ? $paginator->lastPage() : null,
        ];
    }
}
