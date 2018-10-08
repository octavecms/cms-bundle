<?php

namespace Octave\CMSBundle\Page\Block;

use Octave\CMSBundle\Entity\BlockTrait;
use Octave\CMSBundle\Form\Type\MediaGalleryType;

/**
 * @author Igor Lukashov <igor.lukashov@octavecms.com>
 */
class GalleryBlock extends AbstractBlock
{
    const NAME = 'gallery';
    const LABEL = 'Gallery';

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
        return self::LABEL;
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
        return MediaGalleryType::class;
    }

    /**
     * @return string
     */
    public function getContentTemplate()
    {
        return $this->template;
    }

    /**
     * @param BlockTrait $block
     * @return mixed
     */
    public function getContent(BlockTrait $block)
    {
        return json_decode($block->getContent(), true);
    }

    /**
     * @return array
     */
    public function getOptions()
    {
        return [
            'use_translation' => false
        ];
    }
}