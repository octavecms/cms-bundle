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
     * @param bool $showHidden
     * @return array
     */
    public function build(Page $page, $showHidden = false)
    {
        $data = $this->serializer->toArray($page);

        if (!$page->getChildren()) {
            return $data;
        }

        /** @var Page $child */
        foreach ($page->getChildren() as $child) {

            if (!$showHidden && !$child->isIncludeInMenu()) {
                continue;
            }

            $data['children'][] = $this->build($child, $showHidden);
        }

        return $data;
    }
}