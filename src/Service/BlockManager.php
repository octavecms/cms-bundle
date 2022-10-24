<?php

namespace Octave\CMSBundle\Service;

use Exception;
use Octave\CMSBundle\Entity\Blockable;
use Octave\CMSBundle\Entity\BlockEntityInterface;
use Octave\CMSBundle\Entity\Page;
use Octave\CMSBundle\Page\Block\BlockInterface;
use Octave\CMSBundle\Page\Type\FlexiblePageType;
use Twig\Environment;

/**
 * @author Igor Lukashov <igor.lukashov@octavecms.com>
 */
class BlockManager
{
    /** @var Environment */
    private $twig;

    /** @var array */
    private $blocks = [];

    /**
     * BlockManager constructor.
     * @param Environment $twig
     */
    public function __construct(Environment $twig)
    {
        $this->twig = $twig;
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
     * @throws Exception
     */
    public function renderPage(Blockable $page)
    {
        if ($page instanceof Page && $page->getType() != FlexiblePageType::TYPE) {
            throw new \LogicException(sprintf('Invalid type: %s', $page->getType()));
        }

        return $this->renderBlocks($page->getBlocks());
    }

    /**
     * @throws Exception
     */
    public function renderBlocks($blocks, array $parameters = []): string
    {
        $content = '';

        /** @var BlockEntityInterface $blockEntity */
        foreach ($blocks as $blockEntity) {
            $content .= $this->renderBlock($blockEntity, null, $parameters);
        }

        return $content;
    }

    /**
     * @throws Exception
     */
    public function renderBlock(BlockEntityInterface $block, $template = null, array $parameters = []): string
    {
        /** @var BlockInterface $blockType */
        $blockType = $this->blocks[$block->getType()] ?? null;
        if (!$blockType) {
            throw new Exception(sprintf('Unknown type: %s', $block->getType()));
        }

        $blockParameters = array_merge([
            'content' => $blockType->getContent($block),
            'title' => $block->getTitle()
        ], $blockType->getTemplateParameters());

        $blockParameters = array_merge($blockParameters, $parameters);

        return $this->twig->render($template ? $template : $blockType->getContentTemplate(), $blockParameters);
    }
}