<?php

namespace Octave\CMSBundle\Page\Block;

use Octave\CMSBundle\Entity\BlockEntityInterface;

/**
 * @author Igor Lukashov <igor.lukashov@octavecms.com>
 */
abstract class AbstractBlock implements BlockInterface
{
    /** @var array */
    protected $blockOptions;

    /**
     * @return array
     */
    public function getBlockOptions()
    {
        return $this->blockOptions;
    }

    /**
     * @param $name
     * @param $value
     */
    public function addBlockOption($name, $value)
    {
        $this->blockOptions[$name] = $value;
    }

    /**
     * @return array
     */
    public function getOptions()
    {
        return [];
    }

    /**
     * @param BlockEntityInterface $block
     * @return string
     */
    public function getContent(BlockEntityInterface $block)
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