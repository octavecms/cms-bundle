<?php

namespace Octave\CMSBundle\Page\Type;
use Symfony\Component\Routing\RouteCollection;
use Octave\CMSBundle\Entity\Page;
use Octave\CMSBundle\Entity\PageVersion;

/**
 * @author Igor Lukashov <igor.lukashov@octavecms.com>
 */
interface PageTypeInterface
{
    /**
     * @return string
     */
    public function getName();

    /**
     * @return string
     */
    public function getController();

    /**
     * @return string
     */
    public function canCreateRole();

    /**
     * @return string
     */
    public function getIcon();

    /**
     * @return string
     */
    public function getLabel();

    /**
     * @param RouteCollection $routes
     * @param Page $page
     * @return void
     */
    public function setRoutes(RouteCollection $routes, Page $page);

    /**
     * @param Page $page
     * @return array
     */
    public function serialize(Page $page);

    /**
     * @param PageVersion $version
     * @return Page
     */
    public function unserialize(PageVersion $version);
}