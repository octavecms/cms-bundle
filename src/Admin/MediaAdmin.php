<?php

namespace VideInfra\CMSBundle\Admin;

use Sonata\AdminBundle\Admin\AbstractAdmin;
use Sonata\AdminBundle\Route\RouteCollection;

/**
 * @author Igor Lukashov <igor.lukashov@videinfra.com>
 */
class MediaAdmin extends AbstractAdmin
{
    /** @var string */
    protected $baseRouteName = 'media';

    /** @var string */
    protected $baseRoutePattern = '/media';

    /**
     * @param RouteCollection $collection
     */
    protected function configureRoutes(RouteCollection $collection)
    {
        $collection->clearExcept(array('list'));

        $collection->add('category_add', 'category/create', [
            '_controller' => 'VideInfraCMSBundle:Media\Category:categoryAdd'
        ], [], [], '', [], ['POST']);

        $collection->add('category_remove', 'category/remove', [
            '_controller' => 'VideInfraCMSBundle:Media\Category:categoryRemove'
        ], [], [], '', [], ['POST']);

        $collection->add('item_list', 'item/list', [
            '_controller' => 'VideInfraCMSBundle:Media\Item:list'
        ]);

        $collection->add('item_move', 'item/move', [
            '_controller' => 'VideInfraCMSBundle:Media\Item:move'
        ], [], [], '', [], ['POST']);

        $collection->add('item_remove', 'item/remove', [
            '_controller' => 'VideInfraCMSBundle:Media\Item:remove'
        ], [], [], '', [], ['POST']);

        $collection->add('item_upload', 'item/upload', [
            '_controller' => 'VideInfraCMSBundle:Media\Item:upload'
        ], [], [], '', [], ['POST']);
    }
}