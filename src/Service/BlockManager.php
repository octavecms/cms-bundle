<?php

namespace Octave\CMSBundle\Service;
use Symfony\Bundle\TwigBundle\TwigEngine;
use Octave\CMSBundle\Entity\Block;
use Octave\CMSBundle\Entity\Page;
use Octave\CMSBundle\Page\Block\BlockInterface;
use Octave\CMSBundle\Page\Type\BlockPageType;

/**
 * @author Igor Lukashov <igor.lukashov@octavecms.com>
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
     * @param $name
     * @return BlockInterface|null
     */
    public function getBlock($name)
    {
        return $this->blocks[$name] ?? null;
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

            $blockParameters = array_merge([
                'content' => $blockType->getContent($blockEntity),
                'title' => $blockEntity->getTitle()
            ], $blockType->getTemplateParameters());

            $content .= $this->templating->render($blockType->getContentTemplate(), $blockParameters);
        }

        return $content;
    }
}