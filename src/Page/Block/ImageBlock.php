<?php

namespace VideInfra\CMSBundle\Page\Block;

use VideInfra\CMSBundle\Entity\Block;
use VideInfra\CMSBundle\Form\Type\BlockImageType;

/**
 * @author Igor Lukashov <igor.lukashov@videinfra.com>
 */
class ImageBlock extends AbstractBlock
{
    /** @var string */
    private $template;

    /**
     * @param string $template
     */
    public function __construct($template)
    {
        $this->template = $template;
    }

    /**
     * @return string
     */
    public function getName()
    {
        return 'image';
    }

    /**
     * @return string
     */
    public function getLabel()
    {
        return 'Image';
    }

    /**
     * @return string
     */
    public function getIcon()
    {
        return 'fa fa-image';
    }

    /**
     * @return string
     */
    public function getFormType()
    {
        return BlockImageType::class;
    }

    /**
     * @return string
     */
    public function getContentTemplate()
    {
        return $this->template;
    }

    /**
     * @return array
     */
    public function getOptions()
    {
        return [
            'use_translation' => false,
            'show_title' => false
        ];
    }

    /**
     * @param Block $block
     * @return mixed
     */
    public function getContent(Block $block)
    {
        return json_decode($block->getContent(), true);
    }
}