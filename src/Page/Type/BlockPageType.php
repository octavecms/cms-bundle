<?php

namespace VideInfra\CMSBundle\Page\Type;

use VideInfra\CMSBundle\Entity\Block;
use VideInfra\CMSBundle\Entity\BlockTranslation;
use VideInfra\CMSBundle\Entity\Page;
use VideInfra\CMSBundle\Entity\PageVersion;

/**
 * @author Igor Lukashov <igor.lukashov@videinfra.com>
 */
class BlockPageType extends BasePageType
{
    const TYPE = 'block';

    /**
     * @return string
     */
    public function getName()
    {
        return self::TYPE;
    }

    /**
     * @return string
     */
    public function getController()
    {
        return 'VideInfraCMSBundle:Block:edit';
    }

    /**
     * @return string
     */
    public function canCreateRole()
    {
        return 'ROLE_BLOCK_PAGE_CREATE';
    }

    /**
     * @return string
     */
    public function getIcon()
    {
        return 'fa-file-text-o';
    }

    /**
     * @return string
     */
    public function getLabel()
    {
        return 'Blocks';
    }

    /**
     * @param Page $page
     * @return array
     */
    public function serialize(Page $page)
    {
        $content = [];

        $blocks = $page->getBlocks();

        /** @var Block $block */
        foreach ($blocks as $block) {

            $content['blocks'][$block->getId()]['type'] = $block->getType();
            $content['blocks'][$block->getId()]['order'] = $block->getOrder();

            if (!count($block->getTranslations())) {
                $content['blocks'][$block->getId()]['content'] = $block->getContent();
            }
            else {

                $content['blocks'][$block->getId()]['content'] = null;

                /** @var BlockTranslation $translation */
                foreach ($block->getTranslations() as $translation) {
                    $content['blocks'][$block->getId()]['translations'][$translation->getLocale()] = $translation->getContent();
                }
            }
        }

        return $content;
    }

    /**
     * @param PageVersion $version
     * @return Page
     */
    public function unserialize(PageVersion $version)
    {
        $page = $version->getPage();
        $blocks = [];

        /** @var Block $block */
        foreach ($page->getBlocks() as $block) {
            $blocks[$block->getId()] = $block;
        }

        $content = json_decode($version->getContent(), true);
        foreach ($content['blocks'] as $blockId => $block) {

            /** @var Block $blockEntity */
            $blockEntity = $blocks[$blockId] ?? null;

            if (!$blockEntity) {
                $blockEntity = new Block();
                $blockEntity->setPage($page);
            }

            $blockEntity->setType($block['type']);
            $blockEntity->setOrder($block['order']);
            $blockEntity->setContent($block['content']);

            if (isset($block['translations'])) {

                $translations = [];
                foreach ($blockEntity->getTranslations() as $locale => $translation) {
                    $translations[$locale] = $translation;
                }

                foreach ($block['translations'] as $locale => $translationContent) {
                    $translationEntity = $translations[$locale] ?? null;
                    if (!$translationEntity) {
                        $translationEntity = new BlockTranslation();
                        $translationEntity->setTranslatable($blockEntity);
                        $translationEntity->setLocale($locale);
                    }

                    $translationEntity->setContent($translationContent);
                }
            }
        }

        return $page;
    }
}