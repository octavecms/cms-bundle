<?php

namespace Octave\CMSBundle\Admin;

use Sonata\AdminBundle\Admin\AbstractAdmin;
use Sonata\AdminBundle\Route\RouteCollectionInterface;

/**
 * @author Igor Lukashov <igor.lukashov@octavecms.com>
 */
class SitemapAdmin extends AbstractAdmin
{
    /** @var string */
    protected $baseRouteName = 'sitemap';

    /** @var string */
    protected $baseRoutePattern = '/sitemap';

    /**
     * @param RouteCollectionInterface $collection
     */
    protected function configureRoutes(RouteCollectionInterface $collection): void
    {
        $collection->clearExcept(array('list'));

        $collection->add('page_create_type', 'page/create/{type}', [
            '_controller' => 'Octave\CMSBundle\Controller\PageController:createPage'
        ]);

        $collection->add('page_edit', 'page/{id}/edit', [
            '_controller' => 'Octave\CMSBundle\Controller\PageController:edit'
        ]);

        $collection->add('page_add', 'page/create', [
            '_controller' => 'Octave\CMSBundle\Controller\PageController:create'
        ], [], [], '', [], ['POST']);

        $collection->add('page_remove', 'page/remove', [
            '_controller' => 'Octave\CMSBundle\Controller\PageController:remove'
        ], [], [], '', [], ['POST']);

        $collection->add('page_move', 'page/move', [
            '_controller' => 'Octave\CMSBundle\Controller\PageController:move'
        ], [], [], '', [], ['POST']);
    }
}
