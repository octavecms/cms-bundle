<?php

namespace Octave\CMSBundle\Service;

use Octave\CMSBundle\Entity\Page;
use Octave\CMSBundle\Model\TextPageExtensionInterface;

class TextPageExtensionManager
{
    /** @var array */
    private $extensions = [];

    /**
     * @param TextPageExtensionInterface $extension
     */
    public function addExtension(TextPageExtensionInterface $extension)
    {
        $this->extensions[] = $extension;
    }

    /**
     * @param Page $page
     */
    public function executeExtensions(Page $page)
    {
        /** @var TextPageExtensionInterface $extension */
        foreach ($this->extensions as $extension) {
            $extension->execute($page);
        }
    }
}