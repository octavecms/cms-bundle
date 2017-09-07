<?php

namespace VideInfra\CMSBundle\Service;

use VideInfra\CMSBundle\Entity\Page;

/**
 * @author Igor Lukashov <igor.lukashov@videinfra.com>
 */
class PageTreeBuilder
{
    /** @var PageSerializer */
    private $serializer;

    /**
     * PageTreeBuilder constructor.
     * @param PageSerializer $serializer
     */
    public function __construct(PageSerializer $serializer)
    {
        $this->serializer = $serializer;
    }

    /**
     * @param Page $page
     * @return array
     */
    public function build(Page $page)
    {
        $data = $this->serializer->toArray($page);

        if (!$page->getChildren()) {
            return $data;
        }

        foreach ($page->getChildren() as $child) {
            $data['children'][] = $this->build($child);
        }

        return $data;
    }
}