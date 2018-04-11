<?php

namespace Octave\CMSBundle\Page\Type;

use Doctrine\Common\Collections\ArrayCollection;
use Octave\CMSBundle\Entity\Block;
use Octave\CMSBundle\Entity\BlockTranslation;
use Octave\CMSBundle\Entity\Page;
use Octave\CMSBundle\Entity\PageVersion;

/**
 * @author Igor Lukashov <igor.lukashov@octavecms.com>
 */
class FlexiblePageType extends BasePageType
{
    const TYPE = 'flexible_page';

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
        return 'OctaveCMSBundle:FlexiblePage:edit';
    }

    /**
     * @return string
     */
    public function canCreateRole()
    {
        return 'ROLE_FLEXIBLE_PAGE_CREATE';
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
        return 'Flexible';
    }

    /**
     * @param Page $page
     * @return array
     */
    public function serialize(Page $page)
    {
        $content = [];

        $content['name'] = $page->getName();
        $content['path'] = $page->getPath();
        $content['active'] = $page->isActive();
        $content['include_in_menu'] = $page->isIncludeInMenu();
        $content['include_in_sitemap'] = $page->isIncludeInSitemap();

        $blocks = $page->getBlocks();

        $contentBlocks = [];

        /** @var Block $block */
        foreach ($blocks as $block) {

            $contentBlocks[$block->getOrder()]['id'] = $block->getId();
            $contentBlocks[$block->getOrder()]['type'] = $block->getType();
            $contentBlocks[$block->getOrder()]['order'] = (int) $block->getOrder();

            if (!count($block->getTranslations())) {
                $contentBlocks[$block->getOrder()]['content'] = $block->getContent();
            }
            else {

                $contentBlocks[$block->getOrder()]['content'] = null;

                /** @var BlockTranslation $translation */
                foreach ($block->getTranslations() as $translation) {
                    $contentBlocks[$block->getOrder()]['translations'][$translation->getLocale()] = $translation->getContent();
                }
            }
        }

        ksort($contentBlocks);
        $content['blocks'] = $contentBlocks;

        return $content;
    }

    /**
     * @param PageVersion $version
     * @return Page
     */
    public function unserialize(PageVersion $version)
    {
        $page = $version->getPage();
        $content = json_decode($version->getContent(), true);

        $page->setName($content['name'] ?? null);
        $page->setPath($content['path'] ?? null);
        $page->setActive($content['active'] ?? null);
        $page->setIncludeInMenu($content['include_in_menu'] ?? null);
        $page->setIncludeInSitemap($content['include_in_sitemap'] ?? null);

        $blocks = [];

        /** @var Block $block */
        foreach ($page->getBlocks() as $block) {
            $blocks[$block->getId()] = $block;
        }

        $newBlocks = new ArrayCollection();

        if (isset($content['blocks'])) {
            foreach ($content['blocks'] as $blockOrder => $block) {

                /** @var Block $blockEntity */
                $blockEntity = ($block['id'] && isset($blocks[$block['id']])) ? $blocks[$block['id']] : null;

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
                            $blockEntity->addTranslation($translationEntity);
                        }

                        $translationEntity->setContent($translationContent);
                    }
                }

                $newBlocks->add($blockEntity);
            }
        }

        $page->setBlocks($newBlocks);

        return $page;
    }
}