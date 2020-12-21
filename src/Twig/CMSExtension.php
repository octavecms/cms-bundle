<?php

namespace Octave\CMSBundle\Twig;

use Octave\CMSBundle\Entity\Block;
use Octave\CMSBundle\Form\DataTransformer\SimpleFieldDataTransformer;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\Routing\RouterInterface;
use Twig\Extension\AbstractExtension;
use Twig\TwigFilter;
use Twig\TwigFunction;

/**
 * @author Igor Lukashov <igor.lukashov@octavecms.com>
 */
class CMSExtension extends AbstractExtension
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
            new TwigFunction('octave_route_exists', [$this, 'routeExists']),
            new TwigFunction('octave_cms_menu', [$this, 'getMenu']),
            new TwigFunction('octave_current_page', [$this, 'getCurrentPage']),
            new TwigFunction('octave_get_page', [$this, 'getPage']),
            new TwigFunction('octave_render_blocks', [$this, 'renderBlocks']),
            new TwigFunction('octave_render_block', [$this, 'renderBlock']),
        ];
    }

    /**
     * @return array
     */
    public function getFilters()
    {
        return [
            new TwigFilter('octave_resize', [$this, 'resize'])
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
     * @param null $locale
     * @return mixed
     * @throws \Exception
     */
    public function getMenu($itemName, $locale = null)
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
            if ($locale) {
                $page->setCurrentLocale($locale);
            }
        }
        else {
            $page = null;
        }

        $result = $pageRepository->getTree($page, false, false, $locale);
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
     * @param $routeName
     * @return mixed
     */
    public function getPage($routeName)
    {
        $pageManager = $this->container->get('octave.cms.page.manager');
        return isset($pageManager->getPages()[$routeName]) ? $pageManager->getPages()[$routeName] : null;
    }

    /**
     * @param $path
     * @param $width
     * @param $height
     * @return string
     * @throws \Exception
     */
    public function resize($path, $width, $height)
    {
        return $this->container->get('octave.cms.image.processor')->resize($path, $width, $height);
    }

    /**
     * @param $blocks
     * @param bool $transform
     * @return string
     * @throws \Twig\Error\Error
     */
    public function renderBlocks($blocks, $transform = false)
    {
        if ($transform) {

            $transformer = new SimpleFieldDataTransformer();
            $blocks = $transformer->transform($blocks);
        }

        return $this->container->get('octave.cms.block.manager')->renderBlocks($blocks);
    }

    /**
     * @param $blocks
     * @param $type
     * @param bool $transform
     * @return string
     * @throws \Exception
     */
    public function renderBlock($blocks, $type, $transform = false)
    {
        $requiredBlock = null;

        if ($transform) {

            $transformer = new SimpleFieldDataTransformer();
            $blocks = $transformer->transform($blocks);
        }

        foreach ($blocks as $block) {
            if ($block instanceof Block && $block->getType() == $type) {
                $requiredBlock = $block;
                break;
            }
        }

        if (!$requiredBlock) {
            throw new \Exception(sprintf('Type %s not found in given blocks', $type));
        }

        return $this->container->get('octave.cms.block.manager')->renderBlock($requiredBlock);
    }
}