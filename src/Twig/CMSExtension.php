<?php

namespace VideInfra\CMSBundle\Twig;
use Symfony\Component\Routing\RouterInterface;

/**
 * @author Igor Lukashov <igor.lukashov@videinfra.com>
 */
class CMSExtension extends \Twig_Extension
{
    /** @var RouterInterface */
    private $router;

    /**
     * CMSExtension constructor.
     * @param RouterInterface $router
     */
    public function __construct(RouterInterface $router)
    {
        $this->router = $router;
    }

    /**
     * @return array
     */
    public function getFunctions()
    {
        return [
            new \Twig_SimpleFunction('vig_route_exists', [$this, 'routeExist'])
        ];
    }

    /**
     * @param $name
     * @return bool
     */
    public function routeExists($name)
    {
        return (null === $this->router->getRouteCollection()->get($name)) ? false : true;
    }
}