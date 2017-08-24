<?php

namespace VideInfra\CMSBundle\Controller\Media;

use Psr\Log\InvalidArgumentException;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

/**
 * @author Igor Lukashov <igor.lukashov@videinfra.com>
 */
class ItemController extends Controller
{
    /**
     * @param Request $request
     * @return JsonResponse
     */
    public function listAction(Request $request)
    {
        try {
            $categoryId = $request->get('category');

            if (empty($categoryId)) {
                throw new InvalidArgumentException('Category is required');
            }

            if ($categoryId == 'root') {
                $categoryId = null;
            }

            $items = $this->get('vig.cms.media_item.repository')->findByCategory($categoryId);
            $items = $this->get('vig.cms.media_item.serializer')->serialize($items);

            return new JsonResponse([
                'status' => true,
                'data' => $items
            ]);
        }
        catch (\Exception $e) {

            return new JsonResponse(
                [
                    'status' => false,
                    'message' => $e->getMessage()
                ],
                500
            );
        }
    }
}