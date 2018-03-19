<?php

namespace VideInfra\CMSBundle\Service;

use Symfony\Component\Routing\RouterInterface;
use VideInfra\CMSBundle\Entity\Page;

/**
 * @author Igor Lukashov <igor.lukashov@videinfra.com>
 */
class PageSerializer
{
    /** @var RouterInterface */
    private $router;

    /** @var bool */
    private $usePageVersions;

    /**
     * PageSerializer constructor.
     * @param RouterInterface $router
     * @param $usePageVersions
     */
    public function __construct(RouterInterface $router, $usePageVersions)
    {
        $this->router = $router;
        $this->usePageVersions = $usePageVersions;
    }

    /**
     * @param Page $page
     * @return array
     */
    public function toArray(Page $page)
    {
        $children = [];

        /** @var Page $child */
        foreach ($children as $child) {
            $children[] = $this->toArray($child);
        }

        if ($page->getId()) {

            $options = ['id' => $page->getId()];
            if ($this->usePageVersions) {
                $options['version'] = 'draft';
            }

            $editUrl = $this->router->generate('sitemap_page_edit', $options);
        }
        else {
            $editUrl = '#';
        }

        return [
            'id' => $page->getId(),
            'route' => $page->getName(),
            'name' => $page->getTitle(),
            'parent' => ($page->getParent()) ? $page->getParent()->getId() : 'root',
            'active' => $page->isActive(),
            'readonly' => $page->isReadonly(),
            'children' => $children,
            'edit_url' => $editUrl
        ];
    }
}