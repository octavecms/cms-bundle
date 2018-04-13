<?php

namespace Octave\CMSBundle\Page\Block;

use Symfony\Component\Form\Extension\Core\Type\TextareaType;

/**
 * @author Igor Lukashov <igor.lukashov@octavecms.com>
 */
class TextEditorBlock extends AbstractBlock
{
    const NAME = 'text_editor';
    const LABEL = 'Text';

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