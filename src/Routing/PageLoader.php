<?php

namespace VideInfra\CMSBundle\Routing;

use Symfony\Component\Config\Loader\LoaderResolverInterface;
use Symfony\Component\Routing\Route;
use Symfony\Component\Routing\RouteCollection;
use VideInfra\CMSBundle\Entity\Page;
use Symfony\Component\Config\Loader\LoaderInterface;
use VideInfra\CMSBundle\Service\PageManager;

/**
 * @author Igor Lukashov <igor.lukashov@videinfra.com>
 */
class PageLoader implements LoaderInterface
{
    /** @var PageManager */
    private $pageManager;

    /** @var bool  */
    private $loaded = false;

    /**
     * PageLoader constructor.
     * @param PageManager $pageManager
     */
    public function __construct(PageManager $pageManager)
    {
        $this->pageManager = $pageManager;
    }

    /**
     * @param mixed $resource
     * @param null $type
     * @return RouteCollection
     */
    public function load($resource, $type = null)
    {
        if (true === $this->loaded) {
            throw new \RuntimeException('Do not add this loader twice');
        }

        $routes = new RouteCollection();
        $routes->addResource(new EntityResource(Page::class));

        $pages = $this->pageManager->getPages();

        /** @var Page $page */
        foreach ($pages as $page) {
            $options = array_merge($page->getOptions(), ['_controller' => $page->getController()]);
            $route = new Route($page->getPath(), $options);
            $routes->add($page->getName(), $route);
        }

        return $routes;
    }

    /**
     * @param mixed $resource
     * @param null $type
     * @return bool
     */
    public function supports($resource, $type = null)
    {
        return 'vigcmsrouting' === $type;
    }

    /**
     * @inheritdoc
     */
    public function getResolver() {}

    /**
     * @param LoaderResolverInterface $resolver
     */
    public function setResolver(LoaderResolverInterface $resolver) {}
}