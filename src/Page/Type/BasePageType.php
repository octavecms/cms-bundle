<?php

namespace VideInfra\CMSBundle\Page\Type;
use Symfony\Component\Routing\RouteCollection;
use VideInfra\CMSBundle\Entity\Page;
use VideInfra\CMSBundle\Entity\PageVersion;

/**
 * @author Igor Lukashov <igor.lukashov@videinfra.com>
 */
abstract class BasePageType implements PageTypeInterface
{
    /**
     * @param RouteCollection $routes
     * @param Page $page
     */
    public function setRoutes(RouteCollection $routes, Page $page) {}

    /**
     * @param Page $page
     * @return array
     */
    public function serialize(Page $page)
    {
        return null;
    }

    /**
     * @param PageVersion $version
     * @return Page
     */
    public function unserialize(PageVersion $version)
    {
        return $version->getPage();
    }
}