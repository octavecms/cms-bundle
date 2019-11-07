<?php

namespace Octave\CMSBundle\Twig;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\Routing\RouterInterface;

/**
 * @author Igor Lukashov <igor.lukashov@octavecms.com>
 */
class CMSExtension extends \Twig_Extension
{
    /** @var RouterInterface */
    private $router;

    /** @var ContainerInterface */
    private $container;

    /** @var array */
    private $menu = [];

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
            new \Twig_SimpleFunction('octave_route_exists', [$this, 'routeExists']),
            new \Twig_SimpleFunction('octave_cms_menu', [$this, 'getMenu']),
            new \Twig_SimpleFunction('octave_current_page', [$this, 'getCurrentPage'])
        ];
    }

    /**
     * @return array
     */
    public function getFilters()
    {
        return [
            new \Twig_SimpleFilter('octave_resize', [$this, 'resize'])
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
        if (isset($this->menu[$itemName])) {
            return $this->menu[$itemName];
        }

        $pageRepository = $this->container->get('octave.cms.page.repository');

        if ($itemName != 'root') {
            $page = $pageRepository->findOneBy(['name' => $itemName, 'active' => true]);
            if (!$page) {
                throw new \Exception(sprintf('Page with name %s not found', $itemName));
            }
        }
        else {
            $page = null;
        }

        $result = $pageRepository->getTree($page, false, false);
        $this->menu[$itemName] = $result;

        return $result;
    }

    /**
     * @return mixed|null
     */
    public function getCurrentPage()
    {
        return $this->container->get('octave.cms.page.manager')->getCurrentPage();
    }

    /**
     * @param $path
     * @param $width
     * @param $height
     * @return string
     */
    public function resize($path, $width, $height)
    {
        return $this->container->get('octave.cms.image.processor')->resize($path, $width, $height);
    }
}