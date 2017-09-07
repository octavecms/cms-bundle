<?php

namespace VideInfra\CMSBundle\Admin;

use Sonata\AdminBundle\Admin\AbstractAdmin;
use Sonata\AdminBundle\Route\RouteCollection;

/**
 * @author Igor Lukashov <igor.lukashov@videinfra.com>
 */
class SitemapAdmin extends AbstractAdmin
{
    /** @var string */
    protected $baseRouteName = 'sitemap';

    /** @var string */
    protected $baseRoutePattern = '/sitemap';

    /**
     * @param RouteCollection $collection
     */
    protected function configureRoutes(RouteCollection $collection)
    {
        $collection->clearExcept(array('list'));

        $collection->add('page_create_type', 'page/create/{type}', [
            '_controller' => 'VideInfraCMSBundle:Page:createPage'
        ]);

        $collection->add('page_edit', 'page/{id}/edit', [
            '_controller' => 'VideInfraCMSBundle:Page:edit'
        ]);

        $collection->add('page_add', 'page/create', [
            '_controller' => 'VideInfraCMSBundle:Page:create'
        ], [], [], '', [], ['POST']);

        $collection->add('page_remove', 'page/remove', [
            '_controller' => 'VideInfraCMSBundle:Page:remove'
        ], [], [], '', [], ['POST']);

        $collection->add('page_move', 'page/move', [
            '_controller' => 'VideInfraCMSBundle:Page:move'
        ], [], [], '', [], ['POST']);
    }
}
