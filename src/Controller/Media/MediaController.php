<?php

namespace Octave\CMSBundle\Controller\Media;

use Sonata\AdminBundle\Controller\CRUDController;

/**
 * @author Igor Lukashov <igor.lukashov@octavecms.com>
 */
class MediaController extends CRUDController
{
    /**
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function listAction()
    {
        $categories = $this->get('octave.cms.media_category.repository')->getTree();
        $request = $this->getRequest();
        $currentCategory = $request->get('category', 'root');

        $selectMode = $request->get('select_mode');
        $template = 'OctaveCMSBundle:Media:list.html.twig';
        if ($selectMode) $template = 'OctaveCMSBundle:Media:list_raw.html.twig';

        return $this->render($template, [
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