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
            '_controller' => 'VideInfraCMSBundle:Media\Category:create'
        ], [], [], '', [], ['POST']);

        $collection->add('category_remove', 'category/remove', [
            '_controller' => 'VideInfraCMSBundle:Media\Category:remove'
        ], [], [], '', [], ['POST']);

        $collection->add('category_move', 'category/move', [
            '_controller' => 'VideInfraCMSBundle:Media\Category:move'
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

        $collection->add('item_replace', 'item/replace', [
            '_controller' => 'VideInfraCMSBundle:Media\Item:replace'
        ], [], [], '', [], ['POST']);
    }
}