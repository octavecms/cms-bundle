<?php

namespace VideInfra\CMSBundle\Controller;

use Psr\Log\InvalidArgumentException;
use Sonata\AdminBundle\Controller\CRUDController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Doctrine\ORM\EntityManager;
use VideInfra\CMSBundle\Entity\MediaCategory;

/**
 * @author Igor Lukashov <igor.lukashov@videinfra.com>
 */
class MediaController extends CRUDController
{
    /**
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function listAction()
    {
        $categories = $this->get('vig.cms.media_category.repository')->getTree();
        $request = $this->getRequest();
        $currentCategory = $request->get('category', 'root');

        $selectMode = $request->get('select_mode');
        $template = 'VideInfraCMSBundle:Media:list.html.twig';
        if ($selectMode) $template = 'VideInfraCMSBundle:Media:list_raw.html.twig';

        return $this->render($template, [
            'csrf_token' => 'NANANANANANANA BATMAAAAAAAAN',
            'current_category_id' => $currentCategory,
            'root_category' => [
                'id' => 'root',
                'parent' => null,
                'name' => 'Default Category',
                'children' => $categories
            ]
        ]);
    }

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