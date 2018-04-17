<?php

namespace Octave\CMSBundle\Controller;

use Sonata\AdminBundle\Controller\CRUDController;

/**
 * @author Igor Lukashov <igor.lukashov@octavecms.com>
 */
class SitemapController extends CRUDController
{
    /**
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function listAction()
    {
        $pageTypes = $this->get('octave.cms.page.manager')->getAllowedPageTypes();
        $pages = $this->get('octave.cms.page.repository')->getTree(null, true);

        return $this->render('OctaveCMSBundle:Sitemap:list.html.twig', [
            'page_types' => $pageTypes,
            'root_page' => [
                'id' => 'root',
                'parent' => null,
                'name' => 'Site tree',
                'active' => true,
                'readonly' => true,
                'children' => $pages
            ]
        ]);
    }
}
