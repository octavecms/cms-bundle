<?php

namespace VideInfra\CMSBundle\Service;
use VideInfra\CMSBundle\Page\Block\BlockInterface;

/**
 * @author Igor Lukashov <igor.lukashov@videinfra.com>
 */
class BlockManager
{
    /** @var array */
    private $blocks = [];

    /**
     * @param BlockInterface $block
     */
    public function addBlock(BlockInterface $block)
    {
        $this->blocks[$block->getFormType()] = $block;
    }

    /**
     * @return array
     */
    public function getBlocks()
    {
        return $this->blocks;
    }
}