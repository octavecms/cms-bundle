<?php

namespace VideInfra\CMSBundle\Controller;

use Sonata\AdminBundle\Controller\CRUDController;

/**
 * @author Igor Lukashov <igor.lukashov@videinfra.com>
 */
class SitemapController extends CRUDController
{
    /**
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function listAction()
    {
        $pageTypes = $this->get('vig.cms.page.manager')->getAllowedPageTypes();
        $pages = $this->get('vig.cms.page.repository')->getTree();

        return $this->render('VideInfraCMSBundle:Sitemap:list.html.twig', [
            'page_types' => $pageTypes,
            'root_page' => [
                'id' => 'root',
                'parent' => null,
                'name' => 'Home page',
                'active' => true,
                'readonly' => true,
                'children' => $pages
            ]
        ]);
    }
}
