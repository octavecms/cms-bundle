<?php

namespace Octave\CMSBundle\Page\Block;

use Octave\CMSBundle\Entity\Block;
use Octave\CMSBundle\Form\Type\MediaGalleryType;

/**
 * @author Igor Lukashov <igor.lukashov@octavecms.com>
 */
class GalleryBlock extends AbstractBlock
{
    const NAME = 'gallery';

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
        return 'Gallery';
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
     * @param Block $block
     * @return mixed
     */
    public function getContent(Block $block)
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