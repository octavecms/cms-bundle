<?php

namespace VideInfra\CMSBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;

/**
 * @author Igor Lukashov <igor.lukashov@videinfra.com>
 */
abstract class AbstractController extends Controller
{
    /**
     * @param \Exception $exception
     * @return JsonResponse
     */
    protected function generateJsonErrorResponse(\Exception $exception)
    {
        return new JsonResponse(
            [
                'status' => false,
                'message' => $exception->getMessage()
            ],
            500
        );
    }
}