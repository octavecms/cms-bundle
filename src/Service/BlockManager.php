<?php

namespace Octave\CMSBundle\Service;

use Octave\CMSBundle\Entity\Blockable;
use Octave\CMSBundle\Entity\BlockEntityInterface;
use Octave\CMSBundle\Entity\BlockTrait;
use Symfony\Bundle\TwigBundle\TwigEngine;
use Octave\CMSBundle\Entity\Page;
use Octave\CMSBundle\Page\Block\BlockInterface;
use Octave\CMSBundle\Page\Type\FlexiblePageType;

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
     * @param $names
     * @return array
     */
    public function getBlocksByName($names)
    {
        $blocks = [];

        foreach ($names as $name) {
            $blocks[$name] = $this->getBlock($name);
        }

        return $blocks;
    }

    /**
     * @param Blockable $page
     * @return string
     * @throws \Exception
     */
    public function renderPage(Blockable $page)
    {
        if ($page instanceof Page && $page->getType() != FlexiblePageType::TYPE) {
            throw new \LogicException(sprintf('Invalid type: %s', $page->getType()));
        }

        return $this->renderBlocks($page->getBlocks());
    }

    /**
     * @param $blocks
     * @return string
     * @throws \Twig\Error\Error
     * @throws \Exception
     */
    public function renderBlocks($blocks)
    {
        $content = '';

        /** @var BlockTrait $blockEntity */
        foreach ($blocks as $blockEntity) {
            $content .= $this->renderBlock($blockEntity);
        }

        return $content;
    }

    /**
     * @param BlockEntityInterface $block
     * @param null $template
     * @return mixed
     * @throws \Exception
     */
    public function renderBlock(BlockEntityInterface $block, $template = null)
    {
        /** @var BlockInterface $blockType */
        $blockType = $this->blocks[$block->getType()] ?? null;
        if (!$blockType) {
            throw new \Exception(sprintf('Unknown type: %s', $block->getType()));
        }

        $blockParameters = array_merge([
            'content' => $blockType->getContent($block),
            'title' => $block->getTitle()
        ], $blockType->getTemplateParameters());

        return $this->templating->render($template ? $template : $blockType->getContentTemplate(), $blockParameters);
    }
}