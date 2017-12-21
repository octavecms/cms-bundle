<?php

namespace VideInfra\CMSBundle\Page\Type;
use Symfony\Component\Routing\RouteCollection;
use VideInfra\CMSBundle\Entity\Page;

/**
 * @author Igor Lukashov <igor.lukashov@videinfra.com>
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
}