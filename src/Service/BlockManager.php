<?php

namespace VideInfra\CMSBundle\Service;
use Symfony\Bundle\TwigBundle\TwigEngine;
use VideInfra\CMSBundle\Entity\Block;
use VideInfra\CMSBundle\Entity\Page;
use VideInfra\CMSBundle\Page\Block\BlockInterface;
use VideInfra\CMSBundle\Page\Type\BlockPageType;

/**
 * @author Igor Lukashov <igor.lukashov@videinfra.com>
 */
class BlockManager
{
    /** @var TwigEngine */
    private $templating;

    /** @var array */
    private $blocks = [];

    /**
     * BlockManager constructor.
     * @param TwigEngine $twigEngine
     */
    public function __construct(TwigEngine $twigEngine)
    {
        $this->templating = $twigEngine;
    }

    /**
     * @param BlockInterface $block
     */
    public function addBlock(BlockInterface $block)
    {
        $this->blocks[$block->getName()] = $block;
    }

    /**
     * @return array
     */
    public function getBlocks()
    {
        return $this->blocks;
    }

    /**
     * @param Page $page
     * @return string
     * @throws \Exception
     */
    public function renderPage(Page $page)
    {
        if ($page->getType() != BlockPageType::TYPE) {
            throw new \LogicException(sprintf('Invalid type: %s', $page->getType()));
        }

        $content = '';

        /** @var Block $blockEntity */
        foreach ($page->getBlocks() as $blockEntity) {

            /** @var BlockInterface $blockType */
            $blockType = $this->blocks[$blockEntity->getType()] ?? null;
            if (!$blockType) {
                throw new \Exception(sprintf('Unknown type: %s', $blockEntity->getType()));
            }

            $content .= $this->templating->render($blockType->getContentTemplate(),
                ['content' => $blockEntity->getContent()]);
        }

        return $content;
    }
}