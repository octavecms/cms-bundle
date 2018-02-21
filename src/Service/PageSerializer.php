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

    /**
     * PageSerializer constructor.
     * @param RouterInterface $router
     */
    public function __construct(RouterInterface $router)
    {
        $this->router = $router;
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
            $editUrl = $this->router->generate('sitemap_page_edit', ['id' => $page->getId()]);
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