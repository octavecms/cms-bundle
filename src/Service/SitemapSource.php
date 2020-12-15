<?php

namespace Octave\CMSBundle\Service;

use Octave\SitemapBundle\Service\SourceInterface;
use Octave\SitemapBundle\Model\Item;
use Octave\CMSBundle\Repository\PageRepository;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;

class SitemapSource implements SourceInterface
{
    /* @var RouterInterface */
    protected $router;

    /* @var PageRepository */
    protected $pageRepository;

    /* @var string|null */
    protected $host;

    /** @var array */
    protected $locales;

    /**
     *
     * @param RouterInterface $router
     * @param PageRepository $pageRepository
     * @param string|null $host
     * @param $locales
     */
    public function __construct(RouterInterface $router, $pageRepository, $host, $locales)
    {
        $this->router = $router;
        $this->pageRepository = $pageRepository;
        $this->host = rtrim($host, '/');
        $this->locales = $locales;
    }

    /**
     * @return array
     */
    public function getItems()
    {   
        $items = [];
        
        /* @var array */
        $pages = $this->pageRepository->findIncludeInSitemap();
                
         foreach($pages as $page) {
             foreach ($this->locales as $locale) {
                 $items[] = new Item(
                     $this->generateUrl($page->getName(), ['_locale' => $locale]),
                     $page->getUpdatedAt()
                 );
             }
        }

        return $items;
    }

    /**
     * @param string $name
     * @param array $params
     * @return string
     */
    private function generateUrl($name, $params = [])
    {
        return $this->host
            ? $this->host . $this->router->generate($name, $params)
            : $this->router->generate($name, $params, UrlGeneratorInterface::ABSOLUTE_URL);
    }
}