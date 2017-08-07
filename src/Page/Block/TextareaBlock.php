<?php

namespace VideInfra\CMSBundle\Page\Block;

use Symfony\Component\Form\Extension\Core\Type\TextareaType;

/**
 * @author Igor Lukashov <igor.lukashov@videinfra.com>
 */
class TextareaBlock extends AbstractBlock
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
        return 'textarea';
    }

    /**
     * @return string
     */
    public function getLabel()
    {
        return 'Text';
    }

    /**
     * @return string
     */
    public function getIcon()
    {
        return 'fa fa-file-text-o';
    }

    /**
     * @return string
     */
    public function getFormType()
    {
        return TextareaType::class;
    }

    /**
     * @return string
     */
    public function getContentTemplate()
    {
        return $this->template;
    }
}