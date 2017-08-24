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
            '_controller' => 'VideInfraCMSBundle:Media:categoryAdd'
        ], [], [], '', [], ['POST']);
    }
}