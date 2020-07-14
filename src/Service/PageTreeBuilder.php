<?php

namespace Octave\CMSBundle\Service;

use Octave\CMSBundle\Entity\Page;

/**
 * @author Igor Lukashov <igor.lukashov@octavecms.com>
 */
class PageTreeBuilder
{
    /** @var PageSerializer */
    private $serializer;

    /** @var PageManager */
    private $pageManager;

    /**
     * PageTreeBuilder constructor.
     * @param PageSerializer $serializer
     * @param PageManager $pageManager
     */
    public function __construct(PageSerializer $serializer, PageManager $pageManager)
    {
        $this->serializer = $serializer;
        $this->pageManager = $pageManager;
    }

    /**
     * @param Page $page
     * @param bool $showHidden
     * @param bool $editUrl
     * @param null $locale
     * @return array
     */
    public function build(Page $page, $showHidden = false, $editUrl = true, $locale = null)
    {
        if ($locale) {
            $page->setCurrentLocale($locale);
        }
        $data = $this->serializer->toArray($page, $editUrl);

        if (!$page->getChildren()) {
            return $data;
        }

        /** @var Page $child */
        foreach ($page->getChildren() as $child) {

            if (in_array($child->getName(), $this->pageManager->getDeniedRoutes())) {
                continue;
            }

            if (!$showHidden && (!$child->isIncludeInMenu() || !$child->isActive())) {
                continue;
            }

            $data['children'][] = $this->build($child, $showHidden, $editUrl);
        }

        return $data;
    }
}