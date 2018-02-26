<?php

namespace VideInfra\CMSBundle\Page\Type;

use VideInfra\CMSBundle\Entity\Block;
use VideInfra\CMSBundle\Entity\BlockTranslation;
use VideInfra\CMSBundle\Entity\Page;

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

            $content['blocks'][$block->getId()]['content'] = $block->getContent();

            /** @var BlockTranslation $translation */
            foreach ($block->getTranslations() as $translation) {
                $content['blocks'][$block->getId()]['translations'][$translation->getLocale()] = $translation->getContent();
            }
        }

        return $content;
    }
}