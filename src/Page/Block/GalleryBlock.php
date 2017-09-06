<?php

namespace VideInfra\CMSBundle\Page\Block;

use VideInfra\CMSBundle\Form\Type\MediaGalleryType;

/**
 * @author Igor Lukashov <igor.lukashov@videinfra.com>
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
     * @return array
     */
    public function getOptions()
    {
        return [
            'use_translation' => false
        ];
    }
}