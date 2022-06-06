<?php

namespace Octave\CMSBundle\Admin;

use Sonata\AdminBundle\Admin\AbstractAdmin;
use Sonata\AdminBundle\Route\RouteCollectionInterface;

/**
 * @author Igor Lukashov <igor.lukashov@octavecms.com>
 */
class MediaAdmin extends AbstractAdmin
{
    /** @var string */
    protected $baseRouteName = 'media';

    /** @var string */
    protected $baseRoutePattern = '/media';

    /**
     * @param RouteCollectionInterface $collection
     */
    protected function configureRoutes(RouteCollectionInterface $collection): void
    {
        $collection->clearExcept(array('list'));

        $collection->add('category_add', 'category/create', [
            '_controller' => 'OctaveCMSBundle:Media\Category:create'
        ], [], [], '', [], ['POST']);

        $collection->add('category_remove', 'category/remove', [
            '_controller' => 'OctaveCMSBundle:Media\Category:remove'
        ], [], [], '', [], ['POST']);

        $collection->add('category_move', 'category/move', [
            '_controller' => 'OctaveCMSBundle:Media\Category:move'
        ], [], [], '', [], ['POST']);

        $collection->add('item_list', 'item/list', [
            '_controller' => 'OctaveCMSBundle:Media\Item:list'
        ]);

        $collection->add('item_move', 'item/move', [
            '_controller' => 'OctaveCMSBundle:Media\Item:move'
        ], [], [], '', [], ['POST']);

        $collection->add('item_remove', 'item/remove', [
            '_controller' => 'OctaveCMSBundle:Media\Item:remove'
        ], [], [], '', [], ['POST']);

        $collection->add('item_upload', 'item/upload', [
            '_controller' => 'OctaveCMSBundle:Media\Item:upload'
        ], [], [], '', [], ['POST']);

        $collection->add('item_replace', 'item/replace', [
            '_controller' => 'OctaveCMSBundle:Media\Item:replace'
        ], [], [], '', [], ['POST']);
    }
}