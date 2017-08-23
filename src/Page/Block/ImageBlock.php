<?php

namespace VideInfra\CMSBundle\Page\Block;

use Symfony\Component\Form\Extension\Core\Type\FileType;

/**
 * @author Igor Lukashov <igor.lukashov@videinfra.com>
 */
class ImageBlock extends AbstractBlock
{
    /** @var string */
    private $template;

    /**
     * EditorBlock constructor.
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
        return FileType::class;
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