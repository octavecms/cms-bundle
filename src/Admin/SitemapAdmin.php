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
    }
}
