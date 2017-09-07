<?php

namespace VideInfra\CMSBundle\Factory;

use VideInfra\CMSBundle\Page\Type\PageTypeInterface;
use VideInfra\CMSBundle\Service\PageManager;

/**
 * @author Igor Lukashov <igor.lukashov@videinfra.com>
 */
class PageTypeFactory
{
    /** @var PageManager */
    private $pageManager;

    /**
     * PageFactory constructor.
     * @param PageManager $pageManager
     */
    public function __construct(PageManager $pageManager)
    {
        $this->pageManager = $pageManager;
    }

    /**
     * @param $type
     * @return PageTypeInterface
     * @throws \Exception
     */
    public function get($type)
    {
        $pageTypes = $this->pageManager->getTypes();

        /** @var PageTypeInterface $pageType */
        foreach ($pageTypes as $pageType) {
            if ($pageType->getName() == $type) {
                return $pageType;
            }
        }

        throw new \Exception(sprintf('Unsupported page type %s', $pageType));
    }
}