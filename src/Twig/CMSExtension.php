<?php

namespace VideInfra\CMSBundle\Twig;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\Routing\RouterInterface;

/**
 * @author Igor Lukashov <igor.lukashov@videinfra.com>
 */
class CMSExtension extends \Twig_Extension
{
    /** @var RouterInterface */
    private $router;

    /** @var ContainerInterface */
    private $container;

    /**
     * CMSExtension constructor.
     * @param RouterInterface $router
     * @param ContainerInterface $container
     */
    public function __construct(RouterInterface $router, ContainerInterface $container)
    {
        $this->router = $router;
        $this->container = $container;
    }

    /**
     * @return array
     */
    public function getFunctions()
    {
        return [
            new \Twig_SimpleFunction('vig_route_exists', [$this, 'routeExist']),
            new \Twig_SimpleFunction('vig_cms_menu', [$this, 'getMenu'])
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

    /**
     * @param $itemName
     * @return array
     * @throws \Exception
     */
    public function getMenu($itemName)
    {
        $pageRepository = $this->container->get('vig.cms.page.repository');

        if ($itemName != 'root') {
            $page = $pageRepository->findOneBy(['name' => $itemName, 'active' => true]);
            if (!$page) {
                throw new \Exception(sprintf('Page with name %s not found', $itemName));
            }
        }
        else {
            $page = null;
        }

        return $pageRepository->getTree($page);
    }
}