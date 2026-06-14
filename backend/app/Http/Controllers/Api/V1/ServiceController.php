<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Service\StoreServiceRequest;
use App\Http\Requests\Service\UpdateServiceRequest;
use App\Http\Resources\V1\ServiceResource;
use App\Models\Card;
use App\Models\Service;
use App\Services\ServiceOfferingService;
use Illuminate\Http\JsonResponse;

class ServiceController extends Controller
{
    public function __construct(private readonly ServiceOfferingService $services) {}

    public function index(Card $card): JsonResponse
    {
        $this->authorize('view', $card);

        return $this->success(
            ServiceResource::collection($card->services),
            'Services fetched.'
        );
    }

    public function store(StoreServiceRequest $request, Card $card): JsonResponse
    {
        $this->authorize('update', $card);

        $service = $this->services->create($card, $request->validated());

        return $this->created(new ServiceResource($service), 'Service added.');
    }

    public function update(UpdateServiceRequest $request, Service $service): JsonResponse
    {
        $this->authorize('update', $service);

        $service = $this->services->update($service, $request->validated());

        return $this->success(new ServiceResource($service), 'Service updated.');
    }

    public function destroy(Service $service): JsonResponse
    {
        $this->authorize('delete', $service);

        $this->services->delete($service);

        return $this->success(null, 'Service deleted.');
    }
}
