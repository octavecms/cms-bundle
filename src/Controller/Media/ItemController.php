<?php

namespace VideInfra\CMSBundle\Controller\Media;

use Psr\Log\InvalidArgumentException;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use VideInfra\CMSBundle\Entity\MediaItem;

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

    /**
     * @param Request $request
     * @return JsonResponse
     */
    public function moveAction(Request $request)
    {
        try {

            /** @var EntityManager $em */
            $em = $this->getDoctrine()->getManager();

            $fileIds = $request->get('files');
            $categoryId = $request->get('parent');

            if (empty($fileIds)) {
                throw new InvalidArgumentException('Empty list of files');
            }

            if (empty($categoryId)) {
                throw new InvalidArgumentException('Category is required');
            }

            $category = null;
            if ($categoryId != 'root') {
                $category = $this->get('vig.cms.media_category.repository')->find($categoryId);
                if (!$category) {
                    throw new \Exception(sprintf('Unable to find category with id %s', $categoryId));
                }
            }

            $itemRepository = $this->get('vig.cms.media_item.repository');

            foreach ($fileIds as $fileId) {

                /** @var MediaItem $item */
                $item = $itemRepository->find($fileId);
                if (!$item) {
                    throw new \Exception(sprintf('Unable to find item with id %s', $fileId));
                }

                $item->setCategory($category);
            }

            $em->flush();

            return new JsonResponse([
                'status' => true
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