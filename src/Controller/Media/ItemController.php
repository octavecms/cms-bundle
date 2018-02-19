<?php

namespace VideInfra\CMSBundle\Controller\Media;

use Psr\Log\InvalidArgumentException;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use VideInfra\CMSBundle\Controller\AbstractController;
use VideInfra\CMSBundle\Entity\MediaItem;

/**
 * @author Igor Lukashov <igor.lukashov@videinfra.com>
 */
class ItemController extends AbstractController
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
            return $this->generateJsonErrorResponse($e);
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
            $uploadHelper = $this->get('vig.cms.media_upload.helper');

            foreach ($fileIds as $fileId) {

                /** @var MediaItem $item */
                $item = $itemRepository->find($fileId);
                if (!$item) {
                    throw new \Exception(sprintf('Unable to find item with id %s', $fileId));
                }

                $item->setCategory($category);
                $uploadHelper->move($item);
            }

            $em->flush();

            return new JsonResponse([
                'status' => true
            ]);
        }
        catch (\Exception $e) {
            return $this->generateJsonErrorResponse($e);
        }
    }

    /**
     * @param Request $request
     * @return JsonResponse
     */
    public function removeAction(Request $request)
    {
        try {
            /** @var EntityManager $em */
            $em = $this->getDoctrine()->getManager();

            $fileIds = $request->get('files');

            if (empty($fileIds)) {
                throw new InvalidArgumentException('Empty list of files');
            }

            $itemRepository = $this->get('vig.cms.media_item.repository');

            foreach ($fileIds as $fileId) {

                /** @var MediaItem $item */
                $item = $itemRepository->find($fileId);
                if (!$item) {
                    throw new \Exception(sprintf('Unable to find item with id %s', $fileId));
                }

                $em->remove($item);

                $this->get('vig.cms.media_item.manager')->onItemDelete($item);
            }

            $em->flush();

            return new JsonResponse([
                'status' => true
            ]);
        }
        catch (\Exception $e) {
            return $this->generateJsonErrorResponse($e);
        }
    }

    /**
     * @param Request $request
     * @return JsonResponse
     */
    public function uploadAction(Request $request)
    {
        try {
            /** @var EntityManager $em */
            $em = $this->getDoctrine()->getManager();

            $categoryId = $request->get('parent');
            $files = $request->files->get('files');

            if (empty($categoryId)) {
                throw new InvalidArgumentException('Category id is missing');
            }

            $category = null;
            if ($categoryId != 'root') {
                $category = $this->get('vig.cms.media_category.repository')->find($categoryId);
            }

            $items = $this->get('vig.cms.media_upload.helper')->upload($files, $category);
            $em->flush();

            return new JsonResponse([
                'status' => true,
                'files' => $this->get('vig.cms.media_item.serializer')->serialize($items)
            ]);
        }
        catch (\Exception $e) {
            return $this->generateJsonErrorResponse($e);
        }
    }

    /**
     * @param Request $request
     * @return JsonResponse
     */
    public function replaceAction(Request $request)
    {
        try {
            /** @var EntityManager $em */
            $em = $this->getDoctrine()->getManager();

            $itemId = $request->get('replace');
            $files = $request->files->get('files');
            $file = $files[0] ?? null;

            if (empty($itemId)) {
                throw new InvalidArgumentException('Item id is missing');
            }

            if (empty($file)) {
                throw new InvalidArgumentException('File not found');
            }

            $item = $this->get('vig.cms.media_item.repository')->find($itemId);
            if (!$item) {
                throw new \Exception(sprintf('Item with id %s not found', $itemId));
            }

            $this->get('vig.cms.media_upload.helper')->replace($file, $item);
            $em->flush();

            return new JsonResponse([
                'status' => true,
                'files' => $this->get('vig.cms.media_item.serializer')->serialize([$item])
            ]);
        }
        catch (\Exception $e) {
            return $this->generateJsonErrorResponse($e);
        }
    }
}