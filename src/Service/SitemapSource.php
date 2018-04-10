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

    /**
     * 
     * @param RouterInterface $router
     * @param PageRepository $pageRepository
     * @param string|null $host
     */
    public function __construct(RouterInterface $router, $pageRepository, $host)
    {
        $this->router = $router;
        $this->pageRepository = $pageRepository;
        $this->host = rtrim($host, '/');
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
            $items[] = new Item(
                $this->generateUrl($page->getName()),
                $page->getUpdatedAt()
            );
        }

        return $items;
    }

    /**
     * @param string $name
     * @return string
     */
    private function generateUrl($name)
    {
        return $this->host
            ? $this->host . $this->router->generate($name)
            : $this->router->generate($name, [], UrlGeneratorInterface::ABSOLUTE_URL);
    }
}