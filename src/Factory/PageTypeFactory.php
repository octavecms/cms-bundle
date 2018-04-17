<?php

namespace Octave\CMSBundle\Factory;

use Octave\CMSBundle\Page\Type\PageTypeInterface;
use Octave\CMSBundle\Service\PageManager;

/**
 * @author Igor Lukashov <igor.lukashov@octavecms.com>
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
        return $this->pageManager->getType($type);
    }
}