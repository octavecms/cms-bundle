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
            '_controller' => 'Octave\CMSBundle\Controller\Media\CategoryController:createAction'
        ], [], [], '', [], ['POST']);

        $collection->add('category_remove', 'category/remove', [
            '_controller' => 'Octave\CMSBundle\Controller\Media\CategoryController:removeAction'
        ], [], [], '', [], ['POST']);

        $collection->add('category_move', 'category/move', [
            '_controller' => 'Octave\CMSBundle\Controller\Media\CategoryController:moveAction'
        ], [], [], '', [], ['POST']);

        $collection->add('item_list', 'item/list', [
            '_controller' => 'Octave\CMSBundle\Controller\Media\ItemController:listAction'
        ]);

        $collection->add('item_move', 'item/move', [
            '_controller' => 'Octave\CMSBundle\Controller\Media\ItemController:moveAction'
        ], [], [], '', [], ['POST']);

        $collection->add('item_remove', 'item/remove', [
            '_controller' => 'Octave\CMSBundle\Controller\Media\ItemController:removeAction'
        ], [], [], '', [], ['POST']);

        $collection->add('item_upload', 'item/upload', [
            '_controller' => 'Octave\CMSBundle\Controller\Media\ItemController:uploadAction'
        ], [], [], '', [], ['POST']);

        $collection->add('item_replace', 'item/replace', [
            '_controller' => 'Octave\CMSBundle\Controller\Media\ItemController:replaceAction'
        ], [], [], '', [], ['POST']);
    }
}