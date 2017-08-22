<?php

namespace VideInfra\CMSBundle\Controller;

use Sonata\AdminBundle\Controller\CRUDController;

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

        return $this->render('VideInfraCMSBundle:Media:list.html.twig', [

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
}