<?php

namespace VideInfra\CMSBundle\Controller\Media;

use Psr\Log\InvalidArgumentException;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Doctrine\ORM\EntityManager;
use VideInfra\CMSBundle\Entity\MediaCategory;

/**
 * @author Igor Lukashov <igor.lukashov@videinfra.com>
 */
class CategoryController extends AbstractController
{
    /**
     * @param Request $request
     * @return JsonResponse
     */
    public function categoryAddAction(Request $request)
    {
        $name = $request->get('name');
        $parent = $request->get('parent');

        /** @var EntityManager $em */
        $em = $this->getDoctrine()->getManager();

        try {

            if (empty($name)) {
                throw new InvalidArgumentException('Name is required');
            }

            $parentCategory = null;
            if ($parent && $parent != 'root') {
                $parentCategory = $em->getRepository(MediaCategory::class)->find($parent);
                if (empty($parentCategory)) {
                    throw new InvalidArgumentException(sprintf('Unknown parent category: %s', $parent));
                }
            }

            $category = $this->get('vig.cms.media_category.repository')->create();
            $category->setName($name);
            if ($parentCategory) {
                $category->setParent($parentCategory);
            }

            $em->flush($category);

            return new JsonResponse(
                [
                    'status' => true,
                    'data' => [
                        'id' => $category->getId(),
                        'name' => $category->getName(),
                        'parent' => ($category->getParent()) ? $category->getParent()->getId() : 'root',
                        'children' => []
                    ]
                ]
            );
        }
        catch (\Exception $e) {
            return $this->generateJsonErrorResponse($e);
        }
    }

    /**
     * @param Request $request
     * @return JsonResponse
     */
    public function categoryRemoveAction(Request $request)
    {
        try {

            /** @var EntityManager $em */
            $em = $this->getDoctrine()->getManager();
            $categoryId = $request->get('folder');

            if (empty($categoryId)) {
                throw new InvalidArgumentException('Empty category id');
            }

            $category = $em->getRepository(MediaCategory::class)->find($categoryId);
            if (!$category) {
                throw new InvalidArgumentException(sprintf('Category with id %s not found', $categoryId));
            }

            $em->remove($category);
            $em->flush();

            return new JsonResponse([
                'status' => true
            ]);
        }
        catch (\Exception $e) {
            return $this->generateJsonErrorResponse($e);
        }
    }
}