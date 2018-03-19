<?php

namespace VideInfra\CMSBundle\Page\Block;

use VideInfra\CMSBundle\Entity\Block;

/**
 * @author Igor Lukashov <igor.lukashov@videinfra.com>
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
     * @param Block $block
     * @return string
     */
    public function getContent(Block $block)
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