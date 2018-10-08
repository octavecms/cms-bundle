<?php

namespace Octave\CMSBundle\Page\Block;

use Octave\CMSBundle\Entity\BlockTrait;

/**
 * @author Igor Lukashov <igor.lukashov@octavecms.com>
 */
abstract class AbstractBlock implements BlockInterface
{
    /**
     * @return array
     */
    public function getOptions()
    {
        return [];
    }

    /**
     * @param BlockTrait $block
     * @return string
     */
    public function getContent(BlockTrait $block)
    {
        return $block->getContent();
    }

    /**
     * @return array
     */
    public function getTemplateParameters()
    {
        return [];
    }
}