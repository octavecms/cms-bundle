<?php

namespace Octave\CMSBundle\Controller\Media;

use Sonata\AdminBundle\Controller\CRUDController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * @author Igor Lukashov <igor.lukashov@octavecms.com>
 */
class MediaController extends CRUDController
{
    /**
     * @return Response
     */
    public function listAction(Request $request): Response
    {
        $categories = $this->get('octave.cms.media_category.repository')->getTree();
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