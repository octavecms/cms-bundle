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
}