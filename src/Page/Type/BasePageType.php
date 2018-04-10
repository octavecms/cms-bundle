<?php

namespace Octave\CMSBundle\Page\Type;
use Symfony\Component\Routing\RouteCollection;
use Octave\CMSBundle\Entity\Page;
use Octave\CMSBundle\Entity\PageVersion;

/**
 * @author Igor Lukashov <igor.lukashov@octavecms.com>
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