<?php

namespace Octave\CMSBundle\Page\Block;

use Octave\CMSBundle\Entity\Block;
use Octave\CMSBundle\Form\Type\BlockImageType;

/**
 * @author Igor Lukashov <igor.lukashov@octavecms.com>
 */
class ImageBlock extends AbstractBlock
{
    const NAME = 'image';
    const LABEL = 'Image';

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
        return self::NAME;
    }

    /**
     * @return string
     */
    public function getLabel()
    {
        return self::IMAGE;
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